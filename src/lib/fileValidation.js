// Utility functions for file validation and formatting

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
   if (bytes === 0) return '0 Bytes'

   const k = 1024
   const sizes = ['Bytes', 'KB', 'MB', 'GB']
   const i = Math.floor(Math.log(bytes) / Math.log(k))

   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate file size against maximum limit
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSize - Maximum allowed size in bytes (default: 1MB)
 * @returns {object} Validation result
 */
export const validateFileSize = (fileSize, maxSize = 1024 * 1024) => {
   const isValid = fileSize <= maxSize
   return {
      isValid,
      fileSize: formatFileSize(fileSize),
      maxSize: formatFileSize(maxSize),
      error: !isValid ? `File too large. Maximum file size is ${formatFileSize(maxSize)}. Your file is ${formatFileSize(fileSize)}.` : null
   }
}

/**
 * Validate data dimensions for AI analysis
 * @param {number} rows - Number of rows
 * @param {number} columns - Number of columns
 * @returns {object} Validation result
 */
export const validateDataDimensions = (rows, columns) => {
   const maxRows = 1000
   const maxColumns = 10

   const rowsValid = rows <= maxRows
   const columnsValid = columns <= maxColumns
   const isValid = rowsValid && columnsValid

   let error = null
   if (!rowsValid) {
      error = `Dataset too large for AI analysis. Maximum ${maxRows} rows allowed. Your dataset has ${rows} rows.`
   } else if (!columnsValid) {
      error = `Too many columns for AI analysis. Maximum ${maxColumns} columns allowed. Your dataset has ${columns} columns.`
   }

   return {
      isValid,
      rowsValid,
      columnsValid,
      error
   }
}

/**
 * File type validation
 * @param {File} file - File object
 * @returns {object} Validation result
 */
export const validateFileType = (file) => {
   const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
   ]

   const validExtensions = /\.(xlsx|xls|csv)$/i
   const isValidType = validTypes.includes(file.type)
   const isValidExtension = validExtensions.test(file.name)
   const isValid = isValidType || isValidExtension

   return {
      isValid,
      error: !isValid ? 'Please upload a valid Excel (.xlsx, .xls) or CSV file' : null
   }
}
