import { useTheme } from '@shared/context/theme-provider'
import { useKeyboard } from '@shared/hooks/systems/keyboard/useKeyboard'
import { logger } from '@shared/lib/logger/logger.service'
import * as ImagePicker from 'expo-image-picker'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, ScrollView, TouchableOpacity } from 'react-native'
import { RichEditor, actions } from 'react-native-pell-rich-editor'
import Animated, {
    SlideInDown,
    SlideOutDown
} from 'react-native-reanimated'
import { Button } from './button'
import { ColorPicker } from './color-picker'
import { Icon } from './icon'
import { KeyboardWrapper } from './keyboard-wrapper'
import { Text } from './text'
import { View } from './view'

export interface TextEditorRef {
    getContent: () => string
    setContent: (html: string) => void
    focusEditor: () => void
}

export interface TextEditorProps {
    initialContent?: string
    placeholder?: string
    onChange?: (text: string) => void
    className?: string
    editorClassName?: string
    toolbarClassName?: string
    onAttachImage?: (uri: string) => Promise<string>
    onDone?: () => void
    onBack?: () => void
    showAiToneOfVoice?: boolean
    showGoDeeperButton?: boolean
    showAdditionalAiButtons?: boolean
}

export const TextEditor = forwardRef<TextEditorRef, TextEditorProps>((props, ref) => {
    const {
        initialContent = '',
        placeholder = '',
        onChange,
        className = '',
        editorClassName = '',
        toolbarClassName = '',
        onAttachImage,
        onDone,
        onBack,
    } = props
    const { showKeyboard, hideKeyboard, isKeyboardVisible, toggleKeyboard } = useKeyboard()
    const { t } = useTranslation()
    const { isDark, colors } = useTheme()
    const richText = useRef<RichEditor>(null)
    const [content, setContent] = useState(initialContent)
    const [showTextStyles, setShowTextStyles] = useState(false)
    const [height, setHeight] = useState(Dimensions.get('window').height)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [colorPickerMode, setColorPickerMode] = useState<'text' | 'background'>('text')
    const [activeTextStyle, setActiveTextStyle] = useState<string>('body')
    const [activeFormat, setActiveFormat] = useState<Set<string>>(new Set())
    const [selectedTextColor, setSelectedTextColor] = useState('#000000')
    const [selectedBgColor, setSelectedBgColor] = useState('#FFFF00')
    const [showBottomBar, setShowBottomBar] = useState(false)
    const [showBottomBarButton, setShowBottomBarButton] = useState(false)
    const [preventKeyboardShow, setPreventKeyboardShow] = useState(false)

    useEffect(() => {
        logger.log(content, 'текущее содержимое редактора')
    }, [content])

    useEffect(() => {
        setHeight(Dimensions.get('window').height)
        logger.log(height, 'height')
    }, [Dimensions.get('window').height])

    useEffect(() => {
        setShowBottomBarButton(isKeyboardVisible)
    }, [isKeyboardVisible])

    useEffect(() => {
        if (showTextStyles) {
            setPreventKeyboardShow(true)
        } else {
            setPreventKeyboardShow(false)
        }
    }, [showTextStyles])

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        getContent: () => content,
        setContent: (html: string) => {
            setContent(html)
            richText.current?.setContentHTML(html)
        },
        focusEditor: () => richText.current?.focusContentEditor(),
    }))

    // Регистрируем обработчик для нередактируемых блоков
    const registerContentEditableFeature = useCallback(() => {
        if (richText.current) {
            richText.current.commandDOM(`
                // Вспомогательная функция для обработки contenteditable=false
                function handleNonEditableContent() {
                    // Находим все элементы с contenteditable="false"
                    const nonEditableElements = document.querySelectorAll('[contenteditable=false]');
                    
                    // Добавляем обработчики событий
                    nonEditableElements.forEach(function(element) {
                        // Устанавливаем стиль курсора
                        element.style.cursor = 'not-allowed';
                        
                        // Предотвращаем стандартное поведение при клике
                        element.addEventListener('click', function(e) {
                            e.stopPropagation();
                        });
                        
                        // Предотвращаем редактирование при нажатии клавиш
                        element.addEventListener('keydown', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                        });
                    });
                }
                
                // Запускаем функцию при загрузке страницы
                handleNonEditableContent();
                
                // Создаем MutationObserver для отслеживания изменений DOM
                const observer = new MutationObserver(function(mutations) {
                    handleNonEditableContent();
                });
                
                // Начинаем наблюдать за изменениями в DOM
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            `)
        }
    }, [])

    // Регистрация обработчика при загрузке редактора
    useEffect(() => {
        if (richText.current) {
            setTimeout(() => {
                registerContentEditableFeature()
            }, 500) // Даем время для инициализации редактора
        }
    }, [registerContentEditableFeature])

    const handleChange = (html: string) => {
        setContent(html)
        onChange?.(html)
    }

    // Метод для безопасного скрытия клавиатуры
    const safeHideKeyboard = () => {
        // Сначала убираем фокус с редактора
        if (richText.current) {
            richText.current.blurContentEditor()
        }

        // Затем вызываем методы скрытия клавиатуры
        hideKeyboard()

        return new Promise<void>((resolve) => {
            // Даем время для скрытия клавиатуры
            setTimeout(resolve, 150)
        })
    }

    const safeShowKeyboard = () => {
        if (preventKeyboardShow) return Promise.resolve()

        // Сначала устанавливаем фокус на редактор
        if (richText.current) {
            // Даем небольшую задержку перед фокусировкой
            setTimeout(() => {
                richText.current?.focusContentEditor()
                // Явно вызываем показ клавиатуры
                showKeyboard()
            }, 100)
        }

        return new Promise<void>((resolve) => {
            // Даем время для появления клавиатуры
            setTimeout(resolve, 250)
        })
    }

    const toggleTextStyles = async () => {
        logger.log('toggleTextStyles', 'toggleTextStyles')

        if (showTextStyles) {
            setShowTextStyles(false)
            setPreventKeyboardShow(false)
            setTimeout(() => {
                if (richText.current) {
                    richText.current.focusContentEditor()
                    showKeyboard()
                }
            }, 300)
        } else {
            await safeHideKeyboard()
            setShowTextStyles(true)
            setPreventKeyboardShow(true)
        }
    }

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            })

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri
                let imageUrl = uri

                // If custom image handling is provided, use it
                if (onAttachImage) {
                    imageUrl = await onAttachImage(uri)
                }

                // Insert the image into the editor
                richText.current?.insertImage(imageUrl)
            }
        } catch (error) {
            console.error('Error picking image:', error)
        }
    }

    // Функции форматирования
    const applyTextStyle = (style: string) => {
        if (richText.current) {
            setActiveTextStyle(style)

            switch (style) {
                case 'title':
                    richText.current.sendAction(actions.heading1, 'result')
                    break
                case 'heading':
                    richText.current.sendAction(actions.heading2, 'result')
                    break
                case 'subheading':
                    richText.current.sendAction(actions.heading3, 'result')
                    break
                case 'body':
                    richText.current.sendAction(actions.setParagraph, 'result')
                    break
            }

            // Убираем фокус из редактора и предотвращаем показ клавиатуры
            richText.current.blurContentEditor()
        }
    }

    const toggleFormat = (format: string) => {
        if (richText.current) {
            // Переключаем состояние формата (вкл/выкл)
            const newFormats = new Set(activeFormat)
            if (newFormats.has(format)) {
                newFormats.delete(format)
            } else {
                newFormats.add(format)
            }
            setActiveFormat(newFormats)

            // Применяем форматирование к тексту
            switch (format) {
                case 'bold':
                    richText.current.sendAction(actions.setBold, 'result')
                    break
                case 'italic':
                    richText.current.sendAction(actions.setItalic, 'result')
                    break
                case 'underline':
                    richText.current.sendAction(actions.setUnderline, 'result')
                    break
                case 'strikethrough':
                    richText.current.sendAction(actions.setStrikethrough, 'result')
                    break
            }

            // Убираем фокус из редактора и предотвращаем показ клавиатуры
            richText.current.blurContentEditor()
        }
    }

    const openColorPicker = async (mode: 'text' | 'background') => {
        setColorPickerMode(mode)

        // Используем улучшенный метод скрытия клавиатуры
        await safeHideKeyboard()
        setShowColorPicker(!showColorPicker)
    }

    const applyColor = (color: string) => {
        if (richText.current) {
            if (colorPickerMode === 'text') {
                richText.current.sendAction(actions.foreColor, color)
                setSelectedTextColor(color)
            } else {
                richText.current.sendAction(actions.hiliteColor, color)
                setSelectedBgColor(color)
            }

            // Убираем фокус из редактора и предотвращаем показ клавиатуры
            richText.current.blurContentEditor()
        }
    }

    const applyListStyle = (listType: string) => {
        if (richText.current) {
            switch (listType) {
                case 'bullet':
                    richText.current.sendAction(actions.insertBulletsList, 'result')
                    break
                case 'numbered':
                    richText.current.sendAction(actions.insertOrderedList, 'result')
                    break
                case 'checklist':
                    richText.current.sendAction(actions.checkboxList, 'result')
                    break
                case 'indent':
                    richText.current.sendAction(actions.indent, 'result')
                    break
                case 'outdent':
                    richText.current.sendAction(actions.outdent, 'result')
                    break
            }

            // Убираем фокус из редактора и предотвращаем показ клавиатуры
            richText.current.blurContentEditor()
        }
    }

    const applyAlignment = (alignment: string) => {
        if (richText.current) {
            switch (alignment) {
                case 'left':
                    richText.current.sendAction(actions.alignLeft, 'result')
                    break
                case 'center':
                    richText.current.sendAction(actions.alignCenter, 'result')
                    break
                case 'right':
                    richText.current.sendAction(actions.alignRight, 'result')
                    break
            }

            // Убираем фокус из редактора и предотвращаем показ клавиатуры
            richText.current.blurContentEditor()
        }
    }

    // Определение цветов текста и фона на основе темы
    const bgColor = isDark ? colors.background : colors.background
    const textColor = isDark ? colors.text : colors.text
    const accentColor = isDark ? '#FFD60A' : '#FFD60A'

    return (
        <KeyboardWrapper>
            {/* Редактор */}
            <View className="flex-1">
                <RichEditor
                    ref={richText}
                    initialContentHTML={initialContent}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`flex-1 min-h-full ${editorClassName}`}
                    initialHeight={height}
                    pasteAsPlainText={true}
                    editorInitializedCallback={registerContentEditableFeature}
                    editorStyle={{
                        backgroundColor: bgColor,
                        color: textColor,
                        caretColor: accentColor,
                        placeholderColor: isDark ? '#666' : '#999',
                        contentCSSText: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px; padding: 12px;',
                    }}
                />
            </View>

            {/* Кастомная панель форматирования (показывается при нажатии на Aa) */}
            {showTextStyles && !isKeyboardVisible && !showBottomBarButton && (
                <Animated.View
                    entering={SlideInDown.duration(300).springify().damping(15)}
                    exiting={SlideOutDown.duration(250).springify()}
                    className="border-t border-border dark:border-border-dark absolute bottom-0 left-0 right-0"
                >
                    <View className="p-4">
                        <Text className="mb-2 text-lg" variant="default">{t('components.textEditor.format')}</Text>
                        {/* Стили текста (Title, Heading, Subheading, Body) */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="my-4 gap-x-2">
                            <TouchableOpacity
                                onPress={() => applyTextStyle('title')}
                                className={`px-2 py-1 mr-2 rounded-lg items-center justify-center ${activeTextStyle === 'title' ? 'bg-text-dark dark:bg-text' : 'bg-surface-stone dark:bg-surface-stone-dark'}`}
                            >
                                <Text weight="bold" size="xl" variant="default">{t('components.textEditor.title')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => applyTextStyle('heading')}
                                className={`px-2 py-1 mr-2 rounded-lg items-center justify-center ${activeTextStyle === 'heading' ? 'bg-text-dark dark:bg-text' : 'bg-surface-stone dark:bg-surface-stone-dark'}`}
                            >
                                <Text weight="bold" size="lg" variant="default">{t('components.textEditor.heading')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => applyTextStyle('subheading')}
                                className={`px-2 py-1 mr-2 rounded-lg items-center justify-center ${activeTextStyle === 'subheading' ? 'bg-text-dark dark:bg-text' : 'bg-surface-stone dark:bg-surface-stone-dark'}`}
                            >
                                <Text weight="medium" size="base" variant="default">{t('components.textEditor.subheading')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => applyTextStyle('body')}
                                className={`px-2 py-1 mr-2  rounded-lg items-center justify-center ${activeTextStyle === 'body' ? 'bg-text-dark dark:bg-text' : 'bg-surface-stone dark:bg-surface-stone-dark'}`}
                            >
                                <Text size="base" variant="default">{t('components.textEditor.body')}</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        {/* Стили форматирования (B, I, U, S, Color) */}
                        <View className="flex-row mb-4">
                            <TouchableOpacity
                                onPress={() => toggleFormat('bold')}
                                className={`w-14 h-10 items-center justify-center rounded-md mr-1 ${activeFormat.has('bold') ? 'bg-text-dark dark:bg-text' : 'bg-surface-stone dark:bg-surface-stone-dark'}`}
                            >
                                <Text weight="bold" size="lg" variant="default">B</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => toggleFormat('italic')}
                                className={`w-14 h-10 items-center justify-center rounded-md mx-1 ${activeFormat.has('italic') ? 'bg-text-dark dark:bg-text' : 'bg-surface-stone dark:bg-surface-stone-dark'}`}
                            >
                                <Text italic size="lg" variant="default">I</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => toggleFormat('underline')}
                                className={`w-14 h-10 items-center justify-center rounded-md mx-1 ${activeFormat.has('underline') ? 'bg-text-dark dark:bg-text' : 'bg-surface-stone dark:bg-surface-stone-dark'}`}
                            >
                                <Text size="lg" variant="default" style={{ textDecorationLine: 'underline' }}>U</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => toggleFormat('strikethrough')}
                                className={`w-14 h-10 items-center justify-center rounded-md mx-1 ${activeFormat.has('strikethrough') ? 'bg-text-dark dark:bg-text' : 'bg-surface-stone dark:bg-surface-stone-dark'}`}
                            >
                                <Text size="lg" variant="default" style={{ textDecorationLine: 'line-through' }}>S</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => openColorPicker('text')}
                                className="w-12 h-10 items-center justify-center rounded-md mx-1 bg-surface-stone dark:bg-surface-stone-dark"
                            >
                                <Icon name="Palette" size={20} variant="default" fill={selectedTextColor} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => openColorPicker('background')}
                                className="w-12 h-10 items-center justify-center rounded-md ml-1 bg-surface-stone dark:bg-surface-stone-dark"
                            >
                                <Icon name="Highlighter" size={20} variant="default" fill={selectedBgColor} />
                            </TouchableOpacity>
                        </View>

                        {/* Списки и выравнивание */}
                        <View className="flex-row">
                            <TouchableOpacity
                                onPress={() => applyListStyle('bullet')}
                                className="w-14 h-10 items-center justify-center rounded-md mr-1 bg-surface-stone dark:bg-surface-stone-dark"
                            >
                                <Icon name="List" size={20} variant="default" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => applyListStyle('numbered')}
                                className="w-14 h-10 items-center justify-center rounded-md mx-1 bg-surface-stone dark:bg-surface-stone-dark"
                            >
                                <Icon name="ListOrdered" size={20} variant="default" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => applyListStyle('checklist')}
                                className="w-14 h-10 items-center justify-center rounded-md mx-1 bg-surface-stone dark:bg-surface-stone-dark"
                            >
                                <Icon name="ListChecks" size={20} variant="default" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => applyAlignment('left')}
                                className="w-14 h-10 items-center justify-center rounded-md mx-1 bg-surface-stone dark:bg-surface-stone-dark"
                            >
                                <Icon name="AlignLeft" size={20} variant="default" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => applyAlignment('center')}
                                className="w-14 h-10 items-center justify-center rounded-md mx-1 bg-surface-stone dark:bg-surface-stone-dark"
                            >
                                <Icon name="AlignCenter" size={20} variant="default" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => applyAlignment('right')}
                                className="w-14 h-10 items-center justify-center rounded-md ml-1 bg-surface-stone dark:bg-surface-stone-dark"
                            >
                                <Icon name="AlignRight" size={20} variant="default" />
                            </TouchableOpacity>
                        </View>

                        {/* Панель выбора цвета */}
                        {showColorPicker && (
                            <View className="mt-4 pt-4 border-t border-border dark:border-border-dark">
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text variant="default">
                                        {colorPickerMode === 'text'
                                            ? 'components.textEditor.textColor'
                                            : 'components.textEditor.backgroundColor'}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setShowColorPicker(false)}
                                    >
                                        <Icon name="X" size={20} variant="default" />
                                    </TouchableOpacity>
                                </View>
                                <ColorPicker onSelectColor={applyColor} />
                            </View>
                        )}

                        {/* Кнопка переключения на клавиатуру */}
                        <TouchableOpacity
                            onPress={showKeyboard}
                            className="mt-4 py-3 rounded-lg bg-surface-stone dark:bg-surface-stone-dark items-center"
                        >
                            <Text variant="default">{t('components.textEditor.keyboard')}</Text>
                        </TouchableOpacity>

                        {/* Кнопка закрытия */}
                        <TouchableOpacity
                            onPress={toggleTextStyles}
                            className="absolute top-4 right-4"
                        >
                            <Icon name="X" size={24} variant="default" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}

            {/* Нижняя панель над клавиатурой */}
            {showBottomBar && isKeyboardVisible && !showBottomBarButton && (
                <Animated.View
                    entering={SlideInDown.duration(300).damping(15)}
                    exiting={SlideOutDown.duration(250)}
                    className="border-t border-border dark:border-border-dark px-4 py-2 flex-row justify-between items-center"
                >
                    <View className="flex-row">
                        <TouchableOpacity onPress={toggleTextStyles} className="items-center justify-center px-3">
                            <View className="w-8 h-8 items-center justify-center">
                                <Text weight="bold" size="xl" variant="default">Aa</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={pickImage} className="items-center justify-center px-3">
                            <View className="w-8 h-8 items-center justify-center">
                                <Icon name="Paperclip" size={20} variant="default" />
                            </View>
                        </TouchableOpacity>

                    </View>

                    <View className="flex-row items-center space-x-8 ml-auto mr-6">
                        <TouchableOpacity
                            onPress={() => richText.current?.commandDOM('document.execCommand("undo", false, null)')}
                            className="w-8 h-8 items-center justify-center"
                        >
                            <Icon name="Undo" size={20} variant="default" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => richText.current?.commandDOM('document.execCommand("redo", false, null)')}
                            className="w-8 h-8 items-center justify-center"
                        >
                            <Icon name="Redo" size={20} variant="default" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            setShowBottomBarButton(true)
                            setShowBottomBar(false)
                        }}
                        className="w-8 h-8 items-center justify-center"
                    >
                        <Icon name="X" size={20} variant="secondary" />
                    </TouchableOpacity>

                </Animated.View>
            )}

            {/* Кнопка для показа нижней панели */}
            {showBottomBarButton && (
                <Animated.View
                    entering={SlideInDown.duration(300)}
                    exiting={SlideOutDown.duration(250)}
                    className={'absolute bottom-4 left-4 right-4'}
                >
                    <View className="flex-row justify-start gap-x-4">

                        <Button
                            leftIcon="Pencil"
                            variant="outline"
                            iconSize={14}
                            size="sm"
                            onPress={() => {
                                setShowBottomBarButton(false)
                                setShowBottomBar(true)
                            }}
                        />



                        {isKeyboardVisible && (
                            <Button
                                leftIcon="KeyboardOff"
                                variant="outline"
                                size="sm"
                                className="ml-auto"
                                onPress={() => {
                                    safeHideKeyboard()
                                }}
                            />
                        )}
                    </View>
                </Animated.View>
            )}
        </KeyboardWrapper>
    )
})

export default TextEditor
