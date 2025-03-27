import { useTheme } from '@shared/context/theme-provider'
import { useKeyboard } from '@shared/hooks/systems/keyboard/useKeyboard'
import { logger } from '@shared/lib/logger/logger.service'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, TouchableOpacity } from 'react-native'
import QuillEditor from 'react-native-cn-quill'
import Animated, {
    Layout,
    SlideInDown,
    SlideOutDown
} from 'react-native-reanimated'
import { Button } from './button'
import { ColorPicker } from './color-picker'
import { Icon } from './icon'
import { Text } from './text'
import { View } from './view'
import { VoiceInputButton } from './voice/VoiceInputButton'

export interface TextEditorRef {
    getContent: () => string
    setContent: (html: string) => void
    setHtmlContent: (html: string) => void
    setTextContent: (text: string) => void
    focusEditor: () => void
    setCursorPosition: (position: number) => void
    safeHideKeyboard: () => Promise<void>
    scrollToEnd: () => void
}

export interface TextEditorProps {
    initialContent?: string
    placeholder?: string
    onChange?: (text: string) => void
    className?: string
    editorClassName?: string
    toolbarClassName?: string
    onAttachImage?: (uri: string) => Promise<string>
    onSave?: () => void
    onBack?: () => void
    buttonDown?: React.ReactNode
    disabled?: boolean
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
        onSave,
        onBack,
        buttonDown,
        disabled = false
    } = props
    const { showKeyboard, hideKeyboard, isKeyboardVisible } = useKeyboard()
    const { t } = useTranslation()
    const { isDark, colors } = useTheme()
    const richText = useRef<QuillEditor>(null)
    const [content, setContent] = useState(initialContent)
    const [showTextStyles, setShowTextStyles] = useState(false)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [colorPickerMode, setColorPickerMode] = useState<'text' | 'background' | 'none'>('none')
    const [activeTextStyle, setActiveTextStyle] = useState<string>('body')
    const [activeFormat, setActiveFormat] = useState<Set<string>>(new Set())
    const [selectedTextColor, setSelectedTextColor] = useState('#000000')
    const [selectedBgColor, setSelectedBgColor] = useState('#FFFF00')
    const [showBottomBar, setShowBottomBar] = useState(false)
    const [showBottomBarButton, setShowBottomBarButton] = useState(false)
    const [preventKeyboardShow, setPreventKeyboardShow] = useState(false)
    const [autoCorrect, setAutoCorrect] = useState(true)


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

    useEffect(() => {
        setAutoCorrect(false)
    }, [showTextStyles])

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        getContent: () => content,
        setContent: (html: string) => {
            setContent(html)
            if (richText.current) {
                richText.current.insertText(0, html)
            }
        },
        setHtmlContent: (html: string) => {
            setContent(html)
            if (richText.current) {
                try {
                    richText.current.setText('')
                    if (typeof richText.current.dangerouslyPasteHTML === 'function') {
                        richText.current.dangerouslyPasteHTML(0, html)
                    }
                } catch (e) {
                    console.error('Error setting HTML content:', e)
                }
            }
        },
        setTextContent: (text: string) => {
            if (richText.current) {
                try {
                    richText.current.setText('')
                    if (typeof richText.current.insertText === 'function') {
                        richText.current.insertText(0, text)
                    }
                } catch (e) {
                    console.error('Error setting text content:', e)
                }
            }
            setContent(text)
        },
        focusEditor: () => {
            if (richText.current) {
                try {
                    if (typeof richText.current.focus === 'function') {
                        richText.current.focus()
                    }
                } catch (e) {
                    console.error('Error focusing editor:', e)
                }
            }
        },
        setCursorPosition: (position: number) => {
            if (richText.current) {
                try {
                    if (typeof richText.current.focus === 'function') {
                        richText.current.focus()
                    }

                    if (typeof richText.current.dangerouslyPasteHTML === 'function') {
                        richText.current.dangerouslyPasteHTML(position, '')
                    }
                } catch (e) {
                    console.error('Error setting cursor position:', e)
                }
            }
        },
        safeHideKeyboard,
        scrollToEnd: () => {
            if (richText.current) {
                try {
                    if (typeof (richText.current as any).scrollToBottom === 'function') {
                        (richText.current as any).scrollToBottom()
                    } else if (typeof richText.current.dangerouslyPasteHTML === 'function') {
                        const tempId = 'scroll-to-end-' + Date.now()
                        richText.current.dangerouslyPasteHTML(99999, `<div id="${tempId}"></div>`)
                    }
                } catch (e) {
                    console.error('Error scrolling to end:', e)
                }
            }
        }
    }))

    // Регистрируем обработчик для редактора
    const registerContentEditableFeature = useCallback(() => {
        // Инициализация функций редактора после загрузки
        if (richText.current) {
            try {
                console.log('Editor ready')
            } catch (e) {
                console.error('Error in editor initialization:', e)
            }
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

    const handleChange = (html: any) => {
        if (disabled) return
        // Обрабатываем как строку, так и объект с html
        const htmlContent = typeof html === 'string' ? html : html?.html || ''
        setContent(htmlContent)
        onChange?.(htmlContent)
    }

    // Метод для безопасного скрытия клавиатуры
    const safeHideKeyboard = () => {
        // Сначала убираем фокус с редактора
        if (richText.current) {
            try {
                if (typeof richText.current.blur === 'function') {
                    richText.current.blur()
                }
            } catch (e) {
                console.error('Error blurring editor:', e)
            }
        }

        // Затем вызываем методы скрытия клавиатуры
        hideKeyboard()

        return new Promise<void>((resolve) => {
            // Даем время для скрытия клавиатуры
            setTimeout(resolve, 150)
        })
    }

    const toggleTextStyles = async () => {
        if (showTextStyles) {
            setShowTextStyles(false)
            setShowBottomBarButton(true)
        } else {
            setShowTextStyles(true)
            setShowBottomBarButton(false)
        }
    }


    // Функции форматирования
    const applyTextStyle = (style: string) => {
        if (richText.current) {
            setActiveTextStyle(style)

            try {
                if (typeof richText.current.format === 'function') {
                    switch (style) {
                        case 'title':
                            richText.current.format('header', 1)
                            break
                        case 'heading':
                            richText.current.format('header', 2)
                            break
                        case 'subheading':
                            richText.current.format('header', 3)
                            break
                        case 'body':
                            richText.current.format('header', false)
                            break
                    }
                }
            } catch (e) {
                console.error('Error applying text style:', e)
            }
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
            try {
                if (typeof richText.current.format === 'function') {
                    switch (format) {
                        case 'bold':
                            richText.current.format('bold', !newFormats.has('bold'))
                            break
                        case 'italic':
                            richText.current.format('italic', !newFormats.has('italic'))
                            break
                        case 'underline':
                            richText.current.format('underline', !newFormats.has('underline'))
                            break
                        case 'strikethrough':
                            richText.current.format('strike', !newFormats.has('strikethrough'))
                            break
                    }
                }
            } catch (e) {
                console.error('Error toggling format:', e)
            }
        }
    }

    const toggleColorPicker = async (mode: 'text' | 'background' | 'none') => {
        // Если панель уже открыта и мы нажимаем на ту же кнопку - закрываем панель
        if (showColorPicker && colorPickerMode === mode) {
            setShowColorPicker(false)
            setColorPickerMode('none')

            // Удаляем формат из активных при закрытии панели
            const newFormats = new Set(activeFormat)
            newFormats.delete(mode === 'text' ? 'textColor' : 'bgColor')
            setActiveFormat(newFormats)
        }
        // Если панель открыта, но нажали другую кнопку - меняем режим
        else if (showColorPicker && colorPickerMode !== mode) {
            setColorPickerMode(mode)

            // Обновляем активные форматы
            const newFormats = new Set(activeFormat)
            newFormats.delete(colorPickerMode === 'text' ? 'textColor' : 'bgColor')
            newFormats.add(mode === 'text' ? 'textColor' : 'bgColor')
            setActiveFormat(newFormats)
        }
        // Если панель закрыта - открываем с нужным режимом
        else {
            setShowColorPicker(true)
            setColorPickerMode(mode)

            // Добавляем формат в активные
            const newFormats = new Set(activeFormat)
            newFormats.add(mode === 'text' ? 'textColor' : 'bgColor')
            setActiveFormat(newFormats)
        }
    }

    const applyColor = (color: string) => {
        if (!richText.current) return

        // Фокусируемся на редакторе перед применением цвета
        try {
            if (typeof richText.current.focus === 'function') {
                richText.current.focus()
            }
        } catch (e) {
            console.error('Error focusing editor:', e)
        }

        // Короткая задержка перед применением форматирования
        setTimeout(() => {
            if (!richText.current) return
            try {
                if (typeof richText.current.format === 'function') {
                    if (colorPickerMode === 'text') {
                        // Сохраняем выбранный цвет
                        setSelectedTextColor(color)

                        // Применяем цвет текста
                        richText.current.format('color', color)

                        // Добавляем формат в активные
                        const newFormats = new Set(activeFormat)
                        newFormats.add('textColor')
                        setActiveFormat(newFormats)
                    } else if (colorPickerMode === 'background') {
                        // Сохраняем выбранный цвет фона
                        setSelectedBgColor(color)

                        // Применяем цвет фона
                        richText.current.format('background', color)

                        // Добавляем формат в активные
                        const newFormats = new Set(activeFormat)
                        newFormats.add('bgColor')
                        setActiveFormat(newFormats)
                    }
                }
            } catch (e) {
                console.error('Error applying color:', e)
            }

            // Закрываем панель с задержкой
            setTimeout(() => {
                setShowColorPicker(false)
            }, 300)
        }, 50)
    }

    const applyListStyle = (listType: string) => {
        if (richText.current) {
            try {
                if (typeof richText.current.format === 'function') {
                    switch (listType) {
                        case 'bullet':
                            richText.current.format('list', 'bullet')
                            break
                        case 'numbered':
                            richText.current.format('list', 'ordered')
                            break
                        case 'checklist':
                            richText.current.format('list', 'check')
                            break
                        case 'indent':
                            richText.current.format('indent', '+1')
                            break
                        case 'outdent':
                            richText.current.format('indent', '-1')
                            break
                    }
                }
            } catch (e) {
                console.error('Error applying list style:', e)
            }
        }
    }

    const applyAlignment = (alignment: string) => {
        if (richText.current) {
            try {
                if (typeof richText.current.format === 'function') {
                    switch (alignment) {
                        case 'left':
                            richText.current.format('align', 'left')
                            break
                        case 'center':
                            richText.current.format('align', 'center')
                            break
                        case 'right':
                            richText.current.format('align', 'right')
                            break
                    }
                }

                // Убираем фокус из редактора и предотвращаем показ клавиатуры
                if (typeof richText.current.blur === 'function') {
                    richText.current.blur()
                }
            } catch (e) {
                console.error('Error applying alignment:', e)
            }
        }
    }

    // Добавляем функцию для сброса цвета
    const resetColor = () => {
        if (!richText.current) return

        try {
            if (typeof richText.current.focus === 'function') {
                richText.current.focus()
            }
        } catch (e) {
            console.error('Error focusing editor:', e)
        }

        setTimeout(() => {
            if (!richText.current) return
            try {
                if (typeof richText.current.format === 'function') {
                    if (colorPickerMode === 'text') {
                        // Сбрасываем цвет текста на значение по умолчанию
                        const defaultColor = isDark ? '#FFFFFF' : '#000000'
                        setSelectedTextColor(defaultColor)

                        // Используем format для сброса цвета
                        richText.current.format('color', defaultColor)

                        // Удаляем формат из активных форматов
                        const newFormats = new Set(activeFormat)
                        newFormats.delete('textColor')
                        setActiveFormat(newFormats)
                    } else if (colorPickerMode === 'background') {
                        // Сбрасываем цвет фона (делаем прозрачным)
                        setSelectedBgColor('transparent')

                        // Используем false для удаления формата фона
                        richText.current.format('background', false)

                        // Удаляем формат из активных форматов
                        const newFormats = new Set(activeFormat)
                        newFormats.delete('bgColor')
                        setActiveFormat(newFormats)
                    }
                }
            } catch (e) {
                console.error('Error resetting color:', e)
            }

            // Закрываем панель с задержкой
            setTimeout(() => {
                setShowColorPicker(false)
            }, 300)
        }, 50)
    }

    const handleVoiceInput = (text: string) => {
        logger.info(text, 'handleVoiceInput -- editor', 'handleVoiceInput')

        if (richText.current) {
            try {
                // Фокусируемся на редакторе
                if (typeof richText.current.focus === 'function') {
                    richText.current.focus()
                }

                // Вставляем текст
                if (typeof richText.current.insertText === 'function') {
                    // Вставляем текст в текущую позицию или в начало
                    const position = 0
                    richText.current.insertText(position, text)
                }
            } catch (e) {
                console.error('Error handling voice input:', e)
            }
        }
    }

    const changeSave = () => {
        if (disabled) return
        onSave?.()
    }

    // Определение цветов текста и фона на основе темы
    const bgColor = isDark ? colors.background : colors.background
    const textColor = isDark ? colors.text : colors.text
    const accentColor = isDark ? '#FFD60A' : '#FFD60A'

    return (
        <View className='flex-1 relative'>
            {/* Редактор */}
            <QuillEditor
                ref={richText}
                initialHtml={initialContent}
                onHtmlChange={handleChange}
                autoSize={true}
                quill={{
                    modules: {
                        toolbar: false,
                    },
                    placeholder: placeholder,
                }}
                style={{
                    backgroundColor: bgColor,
                    padding: 0,
                    flex: 1,
                    height: '100%',
                }}
                container={false}
                theme={{
                    background: bgColor,
                    color: textColor,
                    placeholder: textColor,
                }}
                webview={{
                    nestedScrollEnabled: true,
                    scrollEnabled: true,
                    style: {
                        flex: 1
                    }
                }}
                customStyles={[
                    `
                    .ql-editor {
                        font-size: 18px; /* Устанавливаем размер шрифта по умолчанию */
                        line-height: 1.5;
                    }
                    .ql-editor p {
                        font-size: 18px; /* Размер для параграфов */
                    }
                    `
                ]}
                customJS={`
                    // Отключаем внешнюю прокрутку и настраиваем только внутреннюю
                    document.body.style.overflowY = 'auto';
                    document.body.style.height = '100%';
                    document.documentElement.style.height = '100%';
                    // Отключаем упругость прокрутки на iOS
                    document.body.style.webkitOverflowScrolling = 'touch';
                    // Предотвращаем двойную прокрутку
                    document.addEventListener('touchmove', function(e) {
                        e.stopPropagation();
                    }, { passive: false });
                    
                    // Добавляем глобальные функции для undo/redo
                    window.performUndo = function() {
                        if (quill && quill.history) {
                            quill.history.undo();
                            return true;
                        }
                        return false;
                    };
                    
                    window.performRedo = function() {
                        if (quill && quill.history) {
                            quill.history.redo();
                            return true;
                        }
                        return false;
                    };
                `}
            />

            {/* Кастомная панель форматирования (показывается при нажатии на Aa) */}
            {!disabled && showTextStyles && (
                <Animated.View
                    entering={SlideInDown.duration(300).springify().damping(15)}
                    exiting={SlideOutDown.duration(250).springify()}
                    layout={Layout.duration(300)}
                    className="border-t border-border dark:border-border-dark "
                >
                    <View className="p-4" variant="default">
                        <Text className="mb-2 text-lg" variant="default">{t('components.textEditor.format')}</Text>

                        {/* Стили текста (Title, Heading, Subheading, Body) */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="my-2 gap-x-2">
                            <TouchableOpacity
                                onPress={() => applyTextStyle('title')}
                                className={`px-2 py-1 mr-2 rounded-lg items-center justify-center ${activeTextStyle === 'title' ? 'bg-text-dark dark:bg-text' : 'bg-surface-stone dark:bg-surface-stone-dark'}`}
                            >
                                <Text weight="bold" size="xl" variant="default">{t('components.textEditor.title1')}</Text>
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
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="my-2 gap-x-2">
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
                                onPress={() => toggleColorPicker('text')}
                                className={`w-12 h-10 items-center justify-center rounded-md mx-1 ${activeFormat.has('textColor') ? 'bg-transparent' : 'bg-surface-stone dark:bg-surface-stone-dark'}`}
                                style={{
                                    borderWidth: 2,
                                    borderColor: activeFormat.has('textColor') ? selectedTextColor : 'transparent',
                                    backgroundColor: colorPickerMode === 'text' && showColorPicker ? 'rgba(0,0,0,0.1)' : undefined
                                }}
                            >
                                <Icon name="Palette" size={20} variant="default" fill={selectedTextColor} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => toggleColorPicker('background')}
                                className={`w-12 h-10 items-center justify-center rounded-md ml-1 ${activeFormat.has('bgColor') ? 'bg-transparent' : 'bg-surface-stone dark:bg-surface-stone-dark'}`}
                                style={{
                                    borderWidth: 2,
                                    borderColor: activeFormat.has('bgColor') ? selectedBgColor : 'transparent',
                                    backgroundColor: colorPickerMode === 'background' && showColorPicker ? 'rgba(0,0,0,0.1)' : undefined
                                }}
                            >
                                <Icon name="Highlighter" size={20} variant="default" fill={selectedBgColor} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => applyListStyle('bullet')}
                                className="w-14 h-10 items-center justify-center rounded-md ml-1 bg-surface-stone dark:bg-surface-stone-dark"
                            >
                                <Icon name="List" size={20} variant="default" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => applyListStyle('numbered')}
                                className="w-14 h-10 items-center justify-center rounded-md ml-1 bg-surface-stone dark:bg-surface-stone-dark"
                            >
                                <Icon name="ListOrdered" size={20} variant="default" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => applyListStyle('checklist')}
                                className="w-14 h-10 items-center justify-center rounded-md ml-1 bg-surface-stone dark:bg-surface-stone-dark"
                            >
                                <Icon name="ListChecks" size={20} variant="default" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => applyAlignment('left')}
                                className="w-14 h-10 items-center justify-center rounded-md ml-1 bg-surface-stone dark:bg-surface-stone-dark"
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
                                <Icon name="AlignRight" size={20} variant="secondary" />
                            </TouchableOpacity>
                        </ScrollView>

                        {/* Панель выбора цвета */}
                        {showColorPicker && (
                            <Animated.View
                                entering={SlideInDown.duration(300).damping(15)}
                                exiting={SlideOutDown.duration(250)}
                                className="pt-2"
                                layout={Layout.duration(300)}
                            >
                                <View className="flex-row justify-between items-center mb-4">
                                    <View className="flex-row items-center">
                                        <Text variant="default">
                                            {colorPickerMode === 'text'
                                                ? t('components.textEditor.textColor')
                                                : t('components.textEditor.backgroundColor')}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={resetColor}
                                            className="ml-3 px-2 py-1 rounded-md bg-surface-stone dark:bg-surface-stone-dark"
                                        >
                                            <Text variant="secondary" size="sm">{t('components.textEditor.resetColor')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowColorPicker(false)
                                            setColorPickerMode('none')
                                            // Удаляем формат из активных при закрытии панели
                                            const newFormats = new Set(activeFormat)
                                            newFormats.delete(colorPickerMode === 'text' ? 'textColor' : 'bgColor')
                                            setActiveFormat(newFormats)
                                        }}
                                    >
                                        <Icon name="X" size={20} variant="default" />
                                    </TouchableOpacity>
                                </View>
                                <ColorPicker
                                    onSelectColor={(color: string) => {
                                        applyColor(color)
                                    }}
                                    selectedColor={colorPickerMode === 'text' ? selectedTextColor : selectedBgColor}
                                />
                            </Animated.View>
                        )}

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

            {/* Кнопка для показа нижней панели */}
            {!disabled && showBottomBarButton && !showTextStyles && (
                <Animated.View
                    entering={SlideInDown.duration(300)}
                    exiting={SlideOutDown.duration(250)}
                    className={'absolute bottom-4 left-4 right-4'}
                >
                    <View className="flex-row justify-start items-end gap-x-4">

                        <Button
                            leftIcon="Pencil"
                            variant="outline"
                            iconSize={14}
                            size="sm"
                            onPress={() => {
                                setShowBottomBarButton(false)
                                setShowTextStyles(true)
                            }}
                        />

                        {buttonDown}

                        <View className="flex-row justify-end items-end gap-x-4 ml-auto">

                            <VoiceInputButton onTranscribe={handleVoiceInput} size="sm" />

                            {isKeyboardVisible && (
                                <Button
                                    leftIcon="KeyboardOff"
                                    variant="outline"
                                    size="sm"
                                    className='ml-auto'
                                    onPress={() => {
                                        safeHideKeyboard()
                                    }}
                                />
                            )}
                            <Button
                                leftIcon="Check"
                                variant="default"
                                onPress={changeSave}
                            />


                        </View>
                    </View>
                </Animated.View>
            )}

            {!disabled && !showBottomBarButton && !showBottomBar && !showTextStyles && (
                <Animated.View
                    entering={SlideInDown.duration(300)}
                    exiting={SlideOutDown.duration(250)}
                    className={'absolute bottom-4 right-8'}
                >
                    <View className="flex-row justify-end gap-x-4">
                        <Button
                            leftIcon="Check"
                            variant="default"
                            className='ml-auto'
                            onPress={changeSave}
                            disabled={!content}
                        />
                    </View>
                </Animated.View>
            )}
        </View>
    )
})

export default TextEditor

