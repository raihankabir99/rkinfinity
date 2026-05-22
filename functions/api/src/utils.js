export const isBengali = (text) => {
    return /[\u0980-\u09FF]/.test(text) || /\b(kaj|kototok|amader|কাজ|কতটুক|koto|dur|kivabe|cholche|obostha)\b/i.test(text);
};