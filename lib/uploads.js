export const MAX_PHOTOS_PER_BUSINESS = 12
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024
export const MAX_MENU_SIZE_BYTES = 10 * 1024 * 1024

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MENU_TYPES = new Set([...IMAGE_TYPES, 'application/pdf'])

function validateFiles(files, { allowedTypes, maxSize, maxFiles, label }) {
  if (!files.length) return { files: [], error: null }

  if (files.length > maxFiles) {
    return { files: [], error: `Puedes seleccionar máximo ${maxFiles} ${label}.` }
  }

  for (const file of files) {
    if (!allowedTypes.has(file.type)) {
      return { files: [], error: `“${file.name}” no tiene un formato permitido.` }
    }

    if (file.size > maxSize) {
      const maximum = Math.round(maxSize / 1024 / 1024)
      return { files: [], error: `“${file.name}” supera el límite de ${maximum} MB.` }
    }
  }

  return { files, error: null }
}

export function validatePhotoFiles(files, existingCount = 0) {
  return validateFiles(files, {
    allowedTypes: IMAGE_TYPES,
    maxSize: MAX_PHOTO_SIZE_BYTES,
    maxFiles: Math.max(0, MAX_PHOTOS_PER_BUSINESS - existingCount),
    label: 'fotos',
  })
}

export function validateMenuFile(file) {
  const result = validateFiles(file ? [file] : [], {
    allowedTypes: MENU_TYPES,
    maxSize: MAX_MENU_SIZE_BYTES,
    maxFiles: 1,
    label: 'archivo para la carta',
  })

  return { file: result.files[0] || null, error: result.error }
}
