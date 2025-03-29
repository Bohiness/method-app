export function htmlContentCountWords(content: string) {
    // Удаляем HTML теги с помощью регулярного выражения
    const textWithoutHtml = content.replace(/<[^>]*>/g, '');
    // Разбиваем очищенный текст на слова по пробельным символам
    const words = textWithoutHtml.split(/\s+/).filter(word => word.length > 0);
    // Возвращаем количество слов
    return words.length;
}
