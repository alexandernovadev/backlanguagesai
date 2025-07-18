import Exam from "../db/models/Exam";

/**
 * Genera un slug a partir de un texto
 * @param text - El texto a convertir en slug
 * @returns Un slug URL-friendly
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
    .replace(/[\s_-]+/g, '-') // Reemplazar espacios y guiones bajos con guiones
    .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
}

/**
 * Genera un slug único verificando que no exista en la base de datos
 * @param baseSlug - El slug base
 * @returns Un slug único
 */
export async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  // Verificar si el slug ya existe
  while (await Exam.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Genera un slug único basado en un título
 * @param title - El título del examen
 * @returns Un slug único basado en el título
 */
export async function generateSlugFromTitle(title: string): Promise<string> {
  const baseSlug = generateSlug(title);
  return await generateUniqueSlug(baseSlug);
} 