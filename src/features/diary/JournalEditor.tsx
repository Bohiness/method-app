import { APP_ROUTES } from '@shared/constants/system/app-routes'
import { useToneOfVoice } from '@shared/hooks/ai/toneOfVoice.hook'
import { useJournal } from '@shared/hooks/diary/journal/useJournal'
import { useShowModal } from '@shared/hooks/modal/useShowModal'
import { logger } from '@shared/lib/logger/logger.service'
import { DeeperType } from '@shared/types/ai/VoiceTone'
import { Badge } from '@shared/ui/badge'
import { Button } from '@shared/ui/button'
import { Text } from '@shared/ui/text'
import TextEditor, { TextEditorRef } from '@shared/ui/text-editor'
import { View } from '@shared/ui/view'
import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

// Создаем объект для хранения функции сохранения
export const journalEditorState = {
    saveHandler: null as null | (() => void),
    journalId: null as number | null, // ID текущего журнала (если редактируем существующий)
    isTemplate: false // Флаг, указывающий, что это шаблон
}

export const JournalEditor: React.FC<{ onSaveDraft: (showSavedMessage: boolean) => void }> = ({ onSaveDraft }) => {
    const { t } = useTranslation()
    const editorRef = useRef<TextEditorRef>(null)
    const { currentTone, goDeeper } = useToneOfVoice()
    const [content, setContent] = useState('')
    const { create, update } = useJournal() // Используем хук для создания/обновления журнала
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Референс для таймера автосохранения

    // Определяем loading indicator здесь для доступа в разных частях компонента
    const loadingIndicator = `
        <div contenteditable="false" style="margin-top: 12px; margin-bottom: 12px;">
            <p style="font-style: italic; color: #666;">
                ${t('components.textEditor.loading')}...
            </p>
        </div>
    `

    // Инициализируем хук для модального окна
    const { showModal, hideModal, updateModal, ModalComponent, visible } = useShowModal()

    // Референс для отслеживания предыдущего значения тона
    const prevToneRef = useRef(currentTone)

    const contentModal = () => {
        if (!currentTone) return null

        const handleGoDeeperInner = (content: string, deeperType?: DeeperType) => {
            setTimeout(() => {
                hideModal()
            }, 100)
            handleGoDeeper(content, deeperType)

        }

        return (
            <View variant="default" className="px-4 py-4">
                <Text
                    size="2xl"
                    weight="bold"
                    className="text-center mb-6"
                >
                    {currentTone?.name} {t('ai.mentor.canHelpYou')}
                </Text>

                <View className="gap-y-4 px-10">
                    <Button
                        className="py-4"
                        variant="default"
                        style={{
                            backgroundImage: `linear-gradient(to right, ${currentTone?.gradient[0]}, ${currentTone?.gradient[1]})`
                        }}
                        onPress={() => handleGoDeeperInner(content, 'nextStep')}
                    >
                        {t('ai.mentor.options.nextStep.title')}
                    </Button>

                    <Button
                        className="py-4"
                        variant="default"
                        style={{
                            backgroundImage: `linear-gradient(to right, ${currentTone?.gradient[0]}, ${currentTone?.gradient[1]})`
                        }}
                        onPress={() => handleGoDeeperInner(content, 'support')}
                    >
                        {t('ai.mentor.options.support.title')}
                    </Button>

                    <Button
                        className="py-4"
                        variant="default"
                        style={{
                            backgroundImage: `linear-gradient(to right, ${currentTone?.gradient[0]}, ${currentTone?.gradient[1]})`
                        }}
                        onPress={() => handleGoDeeperInner(content, 'changeView')}
                    >
                        {t('ai.mentor.options.changeView.title')}
                    </Button>

                    <Button
                        className="py-4"
                        variant="default"
                        style={{
                            backgroundImage: `linear-gradient(to right, ${currentTone?.gradient[0]}, ${currentTone?.gradient[1]})`
                        }}
                        onPress={() => handleGoDeeperInner(content, 'adviceFromFuture')}
                    >
                        {t('ai.mentor.options.adviceFromFuture.title')}
                    </Button>

                    <Button
                        className="py-4"
                        variant="default"
                        style={{
                            backgroundImage: `linear-gradient(to right, ${currentTone?.gradient[0]}, ${currentTone?.gradient[1]})`
                        }}
                        onPress={() => handleGoDeeperInner(content, 'challenge')}
                    >
                        {t('ai.mentor.options.challenge.title')}
                    </Button>
                </View>
            </View>
        )
    }

    // Сохраняем функцию в глобальном объекте вместо route.params
    useEffect(() => {
        journalEditorState.saveHandler = handleSaveLocaleTemplateForClose

        // Очищаем при размонтировании
        return () => {
            journalEditorState.saveHandler = null
            journalEditorState.journalId = null
            journalEditorState.isTemplate = false
        }
    }, [content])

    // Эффект для отслеживания изменений в currentTone
    useEffect(() => {
        // Проверяем что модальное окно видимо и currentTone определен
        if (!visible || !currentTone) return

        // Проверяем изменился ли тон по ID вместо ссылочного сравнения
        const prevToneId = prevToneRef.current?.name_id
        const currentToneId = currentTone?.name_id

        if (prevToneId !== currentToneId) {
            logger.log(`Обновление модального окна: ${prevToneId} -> ${currentToneId}`, 'NoteEditor - updateModal')

            // Явно передаем контент и titleLeftComponent для обновления
            updateModal({
                content: () => (
                    contentModal()
                ),
                titleLeftComponent: () => (
                    <Badge
                        variant="outline"
                        size="sm"
                        onPress={() => router.push(`/${APP_ROUTES.MODALS.SETTINGS.AI_TONE_OF_VOICE}`)}
                        style={{ borderColor: currentTone?.gradient[0] }}
                    >
                        {currentTone?.name}
                    </Badge>
                )
            })

            // Обновляем референс с текущим значением тона
            prevToneRef.current = currentTone
        }
    }, [currentTone, updateModal, t])

    const handleChange = (html: string) => {
        setContent(html)

        // Сбрасываем существующий таймер при каждом изменении контента
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        // Устанавливаем новый таймер на 5 секунд
        saveTimeoutRef.current = setTimeout(() => {
            // Проверяем, что контент не пустой и имеет достаточно символов
            if (html.trim() && html.trim().length >= 10) {
                handleSaveLocaleTemplate()
            }
        }, 5000)
    }

    // Очищаем таймер при размонтировании компонента
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [])

    // Функция для обработки загруженных изображений
    const handleImageUpload = async (uri: string) => {
        // Здесь можно добавить логику загрузки изображения на сервер
        // Например, использование Firebase Storage или другого хранилища
        console.log('Загрузка изображения:', uri)

        // Возвращаем URL изображения (в реальном приложении, это был бы URL после загрузки)
        return uri
    }

    const handleGoDeeper = async (content: string, deeperType?: DeeperType) => {
        try {
            if (!content.trim()) {
                Alert.alert(t('components.textEditor.emptyContent'))
                return
            }

            // Добавляем индикатор загрузки в конец текста
            const contentWithLoading = content + loadingIndicator
            setContent(contentWithLoading)
            editorRef.current?.setHtmlContent(contentWithLoading)

            const bgColor = currentTone?.gradient[0]

            // Создаем обработчик для потоковых обновлений
            const handlePartialResponse = (partialResponse: string) => {
                // Форматируем частичный ответ как нередактируемую стилизованную цитату
                // с атрибутами data-source="ai" и data-model="gpt" для метаданных
                const formattedPartialResponse = `
                    <div style="margin-top: 12px; margin-bottom: 12px;" data-source="ai" data-model="gpt" data-tone="${currentTone?.name_id}">
                        <div contenteditable="false" style="position: relative;">
                            <blockquote style="background-color: ${bgColor}30; border-left: 4px solid ${bgColor}; margin-left: 0; margin-right: 0; padding: 16px; border-radius: 4px; font-style: italic; cursor: not-allowed; user-select: text;">
                                ${partialResponse}
                            </blockquote>
                        </div>
                    </div>
                    <p><br></p>
                `

                // Обновляем редактор с новым частичным ответом
                // Удаляем индикатор загрузки перед добавлением нового контента
                const contentWithoutLoading = content.replace(loadingIndicator, '')
                const newContent = contentWithoutLoading + formattedPartialResponse
                setContent(newContent)

                // Используем правильные методы для QuillEditor
                try {
                    // Используем метод для вставки HTML контента
                    editorRef.current?.setHtmlContent(newContent)

                    // Затем пытаемся установить курсор в конец
                    setTimeout(() => {
                        const length = newContent.length
                        // Метод setCursorPosition от TextEditorRef
                        editorRef.current?.setCursorPosition(length)
                    }, 100)
                } catch (error) {
                    logger.error(error, 'handlePartialResponse', 'Error updating editor content')
                }
            }

            // Вызываем goDeeper с колбэком для обработки частичных ответов
            const aiResponse = await goDeeper({ text: content, settingsOfAi: { typeOfDeeper: deeperType, toneOfVoice: currentTone?.name_id }, onPartialResponse: handlePartialResponse })

            logger.log(aiResponse, 'handleGoDeeper', 'final response')

            if (!aiResponse) {
                // Если ответ пустой, удаляем индикатор загрузки
                const cleanContent = content.replace(loadingIndicator, '')
                setContent(cleanContent)
                editorRef.current?.setHtmlContent(cleanContent)
                return
            }

            // Финальное обновление с полным ответом - в большинстве случаев уже не нужно,
            // так как контент был обновлен в процессе стриминга

            // Проверим, был ли добавлен ответ через потоковую обработку
            const contentWithoutLoading = content.replace(loadingIndicator, '')
            if (contentWithoutLoading === content) {
                // Если индикатор загрузки уже удален (значит был поток), ничего не делаем
                return
            }

            // Если поток не сработал, добавляем ответ вручную
            const formattedResponse = `
                <div style="margin-top: 12px; margin-bottom: 12px;" data-source="ai" data-model="gpt" data-tone="${currentTone?.name_id}">
                    <div contenteditable="false" style="position: relative;">
                        <blockquote style="background-color: ${bgColor}30; border-left: 4px solid ${bgColor}; margin-left: 0; margin-right: 0; padding: 16px; border-radius: 4px; font-style: italic; cursor: not-allowed; user-select: text;">
                            ${aiResponse}
                        </blockquote>
                    </div>
                </div>
                <p><br></p>
            `

            const newContent = contentWithoutLoading + formattedResponse
            setContent(newContent)

            try {
                // Используем метод для вставки HTML контента
                editorRef.current?.setHtmlContent(newContent)

                // Устанавливаем курсор в конец с небольшой задержкой
                setTimeout(() => {
                    editorRef.current?.setCursorPosition(newContent.length)
                }, 100)
            } catch (error) {
                logger.error(error, 'handleGoDeeper', 'Error updating final content')
            }

        } catch (error) {
            logger.error(error, 'handleGoDeeper', 'error')
            // Восстанавливаем исходное содержимое в случае ошибки
            setContent(content)
            editorRef.current?.setHtmlContent(content)

        }
    }

    const handleShowModal = async () => {
        await editorRef.current?.safeHideKeyboard()

        // Проверяем, определен ли currentTone
        if (!currentTone) {
            Alert.alert('Тон не определен, попробуйте позже')
            return
        }

        // Запоминаем текущий тон перед открытием модального окна
        prevToneRef.current = currentTone

        logger.log(`Показ модального окна с тоном: ${currentTone?.name_id}`, 'NoteEditor - showModal')

        // Вызываем showModal с функцией для контента, которая будет использовать актуальное значение currentTone
        showModal({
            content: () => (
                contentModal()
            ),
            titleLeftComponent: () => (
                <Badge
                    variant="outline"
                    size="sm"
                    onPress={() => router.push(`/${APP_ROUTES.MODALS.SETTINGS.AI_TONE_OF_VOICE}`)}
                    style={{ borderColor: currentTone?.gradient[0] }}
                >
                    {currentTone?.name}
                </Badge>
            )
        })
    }

    // Сохранение шаблона (локальный черновик без синхронизации)
    const handleSaveLocaleTemplateForClose = async () => {
        try {
            const currentContent = editorRef.current?.getContent() || content

            if (!currentContent.trim() || currentContent.trim().length < 10) {
                return
            }

            // Заменяем прямой Alert на Alert с выбором
            return new Promise((resolve) => {
                Alert.alert(
                    t('diary.journal.saveDraftTitle'),
                    t('diary.journal.saveDraftMessage'),
                    [
                        {
                            text: t('common.no'),
                            style: 'cancel',
                            onPress: () => resolve(false)
                        },
                        {
                            text: t('common.yes'),
                            onPress: async () => {
                                try {
                                    // Сохраняем как шаблон (черновик)
                                    const data = { content: currentContent }

                                    if (journalEditorState.journalId && journalEditorState.isTemplate) {
                                        // Обновляем существующий шаблон
                                        await update.mutateAsync({
                                            id: journalEditorState.journalId,
                                            data,
                                            isTemplate: true
                                        })
                                    } else {
                                        // Создаем новый шаблон
                                        const result = await create.mutateAsync({
                                            ...data,
                                            isTemplate: true
                                        })

                                        // Обновляем ID в состоянии после создания
                                        journalEditorState.journalId = result.id
                                        journalEditorState.isTemplate = true
                                    }
                                    resolve(true)
                                } catch (error) {
                                    logger.error(error, 'handleSaveLocaleTemplate', 'error')
                                    Alert.alert(t('common.error'), t('diary.journal.errorSavingTemplate'))
                                    resolve(false)
                                }
                            }
                        }
                    ]
                )
            })

        } catch (error) {
            logger.error(error, 'handleSaveLocaleTemplate', 'error')
            Alert.alert(t('common.error'), t('diary.journal.errorSavingTemplate'))
            return Promise.resolve(false)
        }
    }

    // Сохранение шаблона (локальный черновик без синхронизации)
    const handleSaveLocaleTemplate = async () => {
        try {
            const currentContent = editorRef.current?.getContent() || content

            if (!currentContent.trim() || currentContent.trim().length < 10) {
                return
            }
            logger.log(currentContent, 'handleSaveLocaleTemplate')

            // Сохраняем как шаблон (черновик)
            const data = { content: currentContent }

            if (journalEditorState.journalId && journalEditorState.isTemplate) {
                // Обновляем существующий шаблон
                await update.mutateAsync({
                    id: journalEditorState.journalId,
                    data,
                    isTemplate: true
                })
            } else {
                // Создаем новый шаблон
                const result = await create.mutateAsync({
                    ...data,
                    isTemplate: true
                })

                // Обновляем ID в состоянии после создания
                journalEditorState.journalId = result.id
                journalEditorState.isTemplate = true
            }

            // Показываем сообщение о сохранении
            onSaveDraft(true)

            // Скрываем сообщение через 2 секунды
            setTimeout(() => {
                onSaveDraft(false)
            }, 2000)

        } catch (error) {
            logger.error(error, 'handleSaveLocaleTemplate', 'error')
            Alert.alert(t('common.error'), t('diary.journal.errorSavingTemplate'))
        }
    }

    // Сохранение журнала (с отправкой на сервер)
    const handleSave = async () => {
        try {
            const currentContent = editorRef.current?.getContent() || content

            if (!currentContent.trim()) {
                Alert.alert(t('components.textEditor.emptyContent'))
                return
            }

            logger.log(currentContent, 'handleSave')

            const data = { content: currentContent }

            if (journalEditorState.journalId) {
                // Обновляем существующую запись
                await update.mutateAsync({
                    id: journalEditorState.journalId,
                    data
                })

            } else {
                // Создаем новую запись
                const result = await create.mutateAsync(data)

                // Обновляем ID в состоянии после создания
                journalEditorState.journalId = result.id
                journalEditorState.isTemplate = false

            }

            router.dismissTo('/(tabs)')

        } catch (error) {
            logger.error(error, 'handleSave', 'error')
            Alert.alert(t('common.error'), t('diary.journal.errorSavingJournal'))
        }
    }

    return (
        <View className="flex-1 relative">
            <TextEditor
                ref={editorRef}
                onChange={handleChange}
                onSave={handleSave}
                placeholder={t('diary.journal.NotePlaceholder')}
                onAttachImage={handleImageUpload}
                buttonDown={
                    <View className="flex-row gap-x-4">
                        <Button
                            variant="outline"
                            size="sm"
                            bgColor={currentTone?.gradient[0]}
                            textColor={currentTone?.color}
                            onPress={() => handleGoDeeper(content, 'goDeeper')}
                        >
                            {t('components.textEditor.goDeeper')}
                        </Button>

                        <Button
                            leftIcon="ChevronUp"
                            variant="outline"
                            size="sm"
                            bgColor={currentTone?.gradient[0]}
                            iconProps={{
                                color: currentTone?.color
                            }}
                            onPress={handleShowModal}
                        />
                    </View>
                }
            />

            {/* Рендерим компонент модального окна */}
            <ModalComponent />
        </View>
    )
}

export default JournalEditor 