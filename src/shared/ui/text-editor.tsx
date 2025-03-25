import { useTheme } from '@shared/context/theme-provider'
import { useKeyboard } from '@shared/hooks/systems/keyboard/useKeyboard'
import { logger } from '@shared/lib/logger/logger.service'
import * as ImagePicker from 'expo-image-picker'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, TouchableOpacity } from 'react-native'
import { RichEditor, actions } from 'react-native-pell-rich-editor'
import Animated, {
    Layout,
    SlideInDown,
    SlideOutDown
} from 'react-native-reanimated'
import { Button } from './button'
import { ColorPicker } from './color-picker'
import { Icon } from './icon'
import { KeyboardWrapper } from './keyboard-wrapper'
import { Text } from './text'
import { View } from './view'
import { VoiceInputButton } from './voice/VoiceInputButton'

export interface TextEditorRef {
    getContent: () => string
    setContent: (html: string) => void
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
    const { showKeyboard, hideKeyboard, isKeyboardVisible, contentHeight } = useKeyboard()
    const { t } = useTranslation()
    const { isDark, colors } = useTheme()
    const richText = useRef<RichEditor>(null)
    const [content, setContent] = useState(initialContent)
    const [showTextStyles, setShowTextStyles] = useState(false)
    const [height, setHeight] = useState(contentHeight)
    const [editorHeight, setEditorHeight] = useState(contentHeight)
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
        logger.log(contentHeight, 'useEffect –– contentHeight', 'contentHeight changed')
        setHeight(contentHeight)
    }, [contentHeight])

    useEffect(() => {
        logger.log(editorHeight, 'useEffect –– editorHeight', 'editorHeight changed')
    }, [editorHeight])

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
            richText.current?.setContentHTML(html)
        },
        focusEditor: () => richText.current?.focusContentEditor(),
        setCursorPosition: (position: number) => {
            if (richText.current) {
                richText.current.focusContentEditor()
                richText.current.commandDOM(`
                    try {
                        const selection = window.getSelection();
                        if (selection) {
                            // Попробуем найти последний параграф
                            const paragraphs = document.querySelectorAll('p');
                            const lastParagraph = paragraphs[paragraphs.length - 1];
                            
                            if (lastParagraph) {
                                // Если последний параграф существует, ставим курсор в его начало
                                const range = document.createRange();
                                range.setStart(lastParagraph, 0);
                                range.collapse(true);
                                
                                selection.removeAllRanges();
                                selection.addRange(range);
                                
                                console.log('Cursor position set to the beginning of the last paragraph');
                            } else {
                                // Запасной вариант - ищем последний элемент и добавляем новый параграф после него
                                const contentDivs = document.querySelectorAll('[data-source="ai"]');
                                if (contentDivs.length > 0) {
                                    const lastContentDiv = contentDivs[contentDivs.length - 1];
                                    
                                    // Создаем новый параграф
                                    const newParagraph = document.createElement('p');
                                    newParagraph.innerHTML = '<br>';
                                    
                                    // Вставляем новый параграф после последнего AI-блока
                                    if (lastContentDiv.nextSibling) {
                                        lastContentDiv.parentNode.insertBefore(newParagraph, lastContentDiv.nextSibling);
                                    } else {
                                        lastContentDiv.parentNode.appendChild(newParagraph);
                                    }
                                    
                                    // Устанавливаем курсор в начало нового параграфа
                                    const range = document.createRange();
                                    range.setStart(newParagraph, 0);
                                    range.collapse(true);
                                    
                                    selection.removeAllRanges();
                                    selection.addRange(range);
                                    
                                    console.log('Created new paragraph and set cursor position');
                                } else {
                                    // Если не нашли AI-блоки, используем запасной вариант с последним элементом
                                    const allNodes = document.body.getElementsByTagName('*');
                                    if (allNodes.length > 0) {
                                        const lastElement = allNodes[allNodes.length - 1];
                                        
                                        const range = document.createRange();
                                        range.selectNodeContents(lastElement);
                                        range.collapse(false);
                                        
                                        selection.removeAllRanges();
                                        selection.addRange(range);
                                        
                                        console.log('Cursor position set to end of the last element (fallback)');
                                    }
                                }
                            }
                        }
                    } catch(e) {
                        console.error('Error setting cursor position:', e);
                    }
                `)
            }
        },
        safeHideKeyboard,
        scrollToEnd: () => {
            if (richText.current) {
                richText.current.commandDOM(`
                    try {
                        console.log('Scrolling to end with multiple methods');
                        
                        // Метод 1: стандартная прокрутка окна
                        window.scrollTo(0, document.body.scrollHeight);
                        
                        // Метод 2: через scrollIntoView
                        const elements = document.querySelectorAll('p, div, blockquote');
                        if (elements.length > 0) {
                            const lastElement = elements[elements.length - 1];
                            lastElement.scrollIntoView({ block: 'end' });
                            console.log('Scrolled to last element via scrollIntoView');
                        }
                        
                        // Метод 3: через parentElement и scrollTop
                        document.body.parentElement.scrollTop = document.body.parentElement.scrollHeight;
                        
                        // Метод 4: через таймаут (иногда нужно дать время на рендеринг)
                        setTimeout(function() {
                            window.scrollTo(0, document.body.scrollHeight);
                            document.body.parentElement.scrollTop = document.body.parentElement.scrollHeight;
                            
                            const elements = document.querySelectorAll('p, div, blockquote');
                            if (elements.length > 0) {
                                elements[elements.length - 1].scrollIntoView({ block: 'end' });
                            }
                            
                            console.log('Executed delayed scroll');
                        }, 50);
                    } catch(e) {
                        console.error('Error scrolling to end:', e);
                    }
                `)
            }
        }
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
                
                // Функция для проверки применения форматирования
                window.checkFormatting = function() {
                    try {
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            const ancestor = range.commonAncestorContainer;
                            
                            // Проверяем ближайший span для нахождения стилей
                            let spanElement = ancestor;
                            if (ancestor.nodeType === 3) { // Текстовый узел
                                spanElement = ancestor.parentNode;
                            }
                            
                            // Логируем примененные стили
                            console.log('Selected element styles:', 
                                spanElement.style ? {
                                    color: spanElement.style.color,
                                    backgroundColor: spanElement.style.backgroundColor
                                } : 'No styles found');
                        }
                    } catch (e) {
                        console.error('Error checking formatting:', e);
                    }
                }
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
        if (disabled) return
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
        if (showTextStyles) {
            setShowTextStyles(false)
            setShowBottomBar(true)
            setShowBottomBarButton(false)
        } else {
            setShowTextStyles(true)
            setShowBottomBar(false)
            setShowBottomBarButton(false)
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

        // Дополнительно выполняем специальную команду для включения режима styleWithCSS
        richText.current.commandDOM(`
            document.execCommand('styleWithCSS', false, true);
        `)

        // Сначала убедимся, что редактор в фокусе для установки курсора
        richText.current.focusContentEditor()

        // Короткая задержка перед применением форматирования
        setTimeout(() => {
            if (colorPickerMode === 'text') {
                // Сохраняем выбранный цвет
                setSelectedTextColor(color)

                // Устанавливаем стили для текущего и будущего ввода
                richText.current?.commandDOM(`
                    try {
                        // Убедимся, что режим CSS включен
                        document.execCommand('styleWithCSS', false, true);
                        
                        // Если нет выделения, создаём виртуальное выделение в текущей позиции курсора
                        const selection = window.getSelection();
                        if (selection && selection.isCollapsed) {
                            // Создаём маркер в текущей позиции, чтобы сохранить позицию курсора
                            const markerNode = document.createElement('span');
                            markerNode.id = 'temp-marker';
                            markerNode.textContent = '​'; // Невидимый пробел Zero Width Space
                            
                            // Вставляем маркер в текущую позицию
                            const range = selection.getRangeAt(0);
                            range.insertNode(markerNode);
                            
                            // Выделяем маркер для применения стиля
                            range.selectNode(markerNode);
                            selection.removeAllRanges();
                            selection.addRange(range);
                            
                            // Применяем цвет
                            document.execCommand('foreColor', false, '${color}');
                            
                            // Восстанавливаем позицию курсора
                            range.collapse(false);
                            selection.removeAllRanges();
                            selection.addRange(range);
                            
                            // Добавляем обработчик, который сохраняет форматирование при вводе текста
                            if (!window.colorFormatHandlerAdded) {
                                document.execCommand('defaultParagraphSeparator', false, 'p');
                                document.addEventListener('keydown', function(e) {
                                    const sel = window.getSelection();
                                    if (sel && sel.isCollapsed && !e.ctrlKey && !e.metaKey) {
                                        const currentNode = sel.focusNode;
                                        if (currentNode) {
                                            // Автоматически добавляем span с цветом при необходимости
                                            if (currentNode.nodeType === 3) { // Текстовый узел
                                                const parentNode = currentNode.parentNode;
                                                if (parentNode && !parentNode.style?.color) {
                                                    document.execCommand('foreColor', false, '${color}');
                                                }
                                            }
                                        }
                                    }
                                });
                                window.colorFormatHandlerAdded = true;
                            }
                            
                            // Удаляем маркер, но сохраняем стили
                            const marker = document.getElementById('temp-marker');
                            if (marker) {
                                marker.removeAttribute('id');
                            }
                        } else {
                            // Если есть выделение - просто применяем цвет
                            document.execCommand('foreColor', false, '${color}');
                        }
                    } catch(e) {
                        console.error('Error applying text color:', e);
                    }
                `)

                // Добавляем формат в активные
                const newFormats = new Set(activeFormat)
                newFormats.add('textColor')
                setActiveFormat(newFormats)
            } else if (colorPickerMode === 'background') {
                // Сохраняем выбранный цвет фона
                setSelectedBgColor(color)

                // Аналогичный подход для фона
                richText.current?.commandDOM(`
                    try {
                        // Убедимся, что режим CSS включен
                        document.execCommand('styleWithCSS', false, true);
                        
                        // Если нет выделения, создаём виртуальное выделение в текущей позиции курсора
                        const selection = window.getSelection();
                        if (selection && selection.isCollapsed) {
                            // Создаём маркер в текущей позиции
                            const markerNode = document.createElement('span');
                            markerNode.id = 'temp-bg-marker';
                            markerNode.textContent = '​'; // Невидимый пробел
                            
                            // Вставляем маркер в текущую позицию
                            const range = selection.getRangeAt(0);
                            range.insertNode(markerNode);
                            
                            // Выделяем маркер для применения стиля
                            range.selectNode(markerNode);
                            selection.removeAllRanges();
                            selection.addRange(range);
                            
                            // Применяем цвет фона
                            document.execCommand('hiliteColor', false, '${color}');
                            
                            // Восстанавливаем позицию курсора
                            range.collapse(false);
                            selection.removeAllRanges();
                            selection.addRange(range);
                            
                            // Добавляем обработчик, который сохраняет форматирование при вводе текста
                            if (!window.bgColorFormatHandlerAdded) {
                                document.addEventListener('keydown', function(e) {
                                    const sel = window.getSelection();
                                    if (sel && sel.isCollapsed && !e.ctrlKey && !e.metaKey) {
                                        const currentNode = sel.focusNode;
                                        if (currentNode) {
                                            // Автоматически добавляем span с цветом фона при необходимости
                                            if (currentNode.nodeType === 3) { // Текстовый узел
                                                const parentNode = currentNode.parentNode;
                                                if (parentNode && !parentNode.style?.backgroundColor) {
                                                    document.execCommand('hiliteColor', false, '${color}');
                                                }
                                            }
                                        }
                                    }
                                });
                                window.bgColorFormatHandlerAdded = true;
                            }
                            
                            // Удаляем маркер, но сохраняем стили
                            const marker = document.getElementById('temp-bg-marker');
                            if (marker) {
                                marker.removeAttribute('id');
                            }
                        } else {
                            // Если есть выделение - просто применяем цвет фона
                            document.execCommand('hiliteColor', false, '${color}');
                        }
                        console.log('Applied background color: ${color}');
                    } catch(e) {
                        console.error('Error applying background color:', e);
                    }
                `)

                // Добавляем формат в активные
                const newFormats = new Set(activeFormat)
                newFormats.add('bgColor')
                setActiveFormat(newFormats)
            }

            // Проверяем примененные стили с задержкой
            setTimeout(() => {
                richText.current?.commandDOM(`window.checkFormatting();`)

                // Закрываем панель с задержкой
                setShowColorPicker(false)
            }, 300)
        }, 50)
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

    // Добавляем функцию для сброса цвета
    const resetColor = () => {
        if (!richText.current) return

        richText.current.focusContentEditor()

        setTimeout(() => {
            if (colorPickerMode === 'text') {
                // Сбрасываем цвет текста на значение по умолчанию
                const defaultColor = isDark ? '#FFFFFF' : '#000000'
                setSelectedTextColor(defaultColor)

                richText.current?.commandDOM(`
                    try {
                        // Убедимся, что режим CSS включен
                        document.execCommand('styleWithCSS', false, true);
                        
                        // Удаляем обработчик, который сохраняет форматирование при вводе текста
                        if (window.colorFormatHandlerAdded) {
                            const oldHandler = document.onkeydown;
                            document.removeEventListener('keydown', oldHandler);
                            window.colorFormatHandlerAdded = false;
                            console.log('Removed text color format handler');
                        }
                        
                        // Если нет выделения, создаём виртуальное выделение в текущей позиции курсора
                        const selection = window.getSelection();
                        if (selection && selection.isCollapsed) {
                            // Создаём маркер в текущей позиции для сброса стилей
                            const markerNode = document.createElement('span');
                            markerNode.id = 'temp-reset-marker';
                            markerNode.textContent = '​'; // Невидимый пробел
                            
                            // Вставляем маркер в текущую позицию
                            const range = selection.getRangeAt(0);
                            range.insertNode(markerNode);
                            
                            // Выделяем маркер для применения стиля
                            range.selectNode(markerNode);
                            selection.removeAllRanges();
                            selection.addRange(range);
                            
                            // Применяем сброс форматирования
                            document.execCommand('removeFormat', false, null);
                            document.execCommand('foreColor', false, '${defaultColor}');
                            
                            // Восстанавливаем позицию курсора
                            range.collapse(false);
                            selection.removeAllRanges();
                            selection.addRange(range);
                            
                            // Удаляем маркер, но сохраняем сброшенные стили
                            const marker = document.getElementById('temp-reset-marker');
                            if (marker) {
                                marker.removeAttribute('id');
                            }
                        } else {
                            // Если есть выделение - просто сбрасываем форматирование
                            document.execCommand('removeFormat', false, null);
                            document.execCommand('foreColor', false, '${defaultColor}');
                        }
                        
                        // Устанавливаем обработчик для будущего форматирования с дефолтным цветом
                        document.addEventListener('keydown', function resetHandler(e) {
                            const sel = window.getSelection();
                            if (sel && sel.isCollapsed && !e.ctrlKey && !e.metaKey) {
                                const currentNode = sel.focusNode;
                                if (currentNode && currentNode.nodeType === 3) { // Текстовый узел
                                    const parentNode = currentNode.parentNode;
                                    if (parentNode && parentNode.style && parentNode.style.color !== '${defaultColor}') {
                                        document.execCommand('foreColor', false, '${defaultColor}');
                                    }
                                }
                            }
                        });
                        
                        console.log('Reset text color to default: ${defaultColor}');
                    } catch(e) {
                        console.error('Error resetting text color:', e);
                    }
                `)

                // Удаляем формат из активных форматов
                const newFormats = new Set(activeFormat)
                newFormats.delete('textColor')
                setActiveFormat(newFormats)
            } else if (colorPickerMode === 'background') {
                // Сбрасываем цвет фона (делаем прозрачным)
                setSelectedBgColor('transparent')

                richText.current?.commandDOM(`
                    try {
                        // Убедимся, что режим CSS включен
                        document.execCommand('styleWithCSS', false, true);
                        
                        // Удаляем обработчик, который сохраняет форматирование фона при вводе текста
                        if (window.bgColorFormatHandlerAdded) {
                            const oldHandler = document.onkeydown;
                            document.removeEventListener('keydown', oldHandler);
                            window.bgColorFormatHandlerAdded = false;
                            console.log('Removed background color format handler');
                        }
                        
                        // Если нет выделения, создаём виртуальное выделение в текущей позиции курсора
                        const selection = window.getSelection();
                        if (selection && selection.isCollapsed) {
                            // Создаём маркер в текущей позиции для сброса стилей
                            const markerNode = document.createElement('span');
                            markerNode.id = 'temp-bg-reset-marker';
                            markerNode.textContent = '​'; // Невидимый пробел
                            
                            // Вставляем маркер в текущую позицию
                            const range = selection.getRangeAt(0);
                            range.insertNode(markerNode);
                            
                            // Выделяем маркер для применения стиля
                            range.selectNode(markerNode);
                            selection.removeAllRanges();
                            selection.addRange(range);
                            
                            // Применяем сброс форматирования
                            document.execCommand('removeFormat', false, null);
                            
                            // Восстанавливаем позицию курсора
                            range.collapse(false);
                            selection.removeAllRanges();
                            selection.addRange(range);
                            
                            // Удаляем маркер
                            const marker = document.getElementById('temp-bg-reset-marker');
                            if (marker) {
                                marker.removeAttribute('id');
                            }
                        } else {
                            // Если есть выделение - просто сбрасываем форматирование
                            document.execCommand('removeFormat', false, null);
                        }
                        
                        console.log('Reset background color to transparent');
                    } catch(e) {
                        console.error('Error resetting background color:', e);
                    }
                `)

                // Удаляем формат из активных форматов
                const newFormats = new Set(activeFormat)
                newFormats.delete('bgColor')
                setActiveFormat(newFormats)
            }

            // Закрываем панель с задержкой
            setTimeout(() => {
                setShowColorPicker(false)
            }, 300)
        }, 50)
    }

    const handleVoiceInput = (text: string) => {
        logger.info(text, 'handleVoiceInput -- editor', 'handleVoiceInput')

        // Экранируем специальные символы в тексте
        const escapedText = text
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')

        richText.current?.commandDOM(`
            try {
                // Убедимся, что режим CSS включен
                document.execCommand('styleWithCSS', false, true);
    
                // Вставляем текст в редактор на позицию курсора
                document.execCommand('insertHTML', false, '${escapedText}');
            } catch(e) {
                console.error('Error inserting text from server:', e);
            }
        `)
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
        <KeyboardWrapper>
            {/* Редактор */}
            <View className="relative flex-1 scroll-auto overflow-hidden" style={{ height: height }}>
                <RichEditor
                    ref={richText}
                    initialContentHTML={initialContent}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`flex-1 ${editorClassName}`}
                    pasteAsPlainText={true}
                    editorInitializedCallback={registerContentEditableFeature}
                    autoCorrect={autoCorrect}
                    initialHeight={height}
                    onHeightChange={(height) => {
                        setEditorHeight(height)
                    }}
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

            {/* Нижняя панель над клавиатурой */}
            {!disabled && showBottomBar && !showBottomBarButton && (
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

                        {/* <TouchableOpacity onPress={pickImage} className="items-center justify-center px-3">
                            <View className="w-8 h-8 items-center justify-center">
                                <Icon name="Paperclip" size={20} variant="default" />
                            </View>
                        </TouchableOpacity> */}

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
            {!disabled && showBottomBarButton && !showTextStyles && (
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

                        {buttonDown}

                        <View className="flex-row justify-end gap-x-4 ml-auto">
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
                                size="sm"
                                onPress={changeSave}
                            />
                            <VoiceInputButton onTranscribe={handleVoiceInput} className='absolute right-6 bottom-16' />

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
        </KeyboardWrapper>
    )
})

export default TextEditor
