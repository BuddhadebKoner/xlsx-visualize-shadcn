import { create } from 'zustand'

const useExcelStore = create((set, get) => ({
   // State
   data: [],
   headers: [],
   fileName: '',
   isDataLoaded: false,

   // Actions
   setData: (data, headers, fileName) => set({
      data,
      headers,
      fileName,
      isDataLoaded: true
   }),

   clearData: () => set({
      data: [],
      headers: [],
      fileName: '',
      isDataLoaded: false
   }),

   // Getters
   getFilteredData: (searchTerm) => {
      const { data } = get()
      if (!searchTerm) return data

      return data.filter(row =>
         Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
         )
      )
   },

   getColumnData: (columnName) => {
      const { data } = get()
      return data.map(row => row[columnName]).filter(value => value !== undefined)
   },

   getNumericColumns: () => {
      const { headers, data } = get()
      if (!data.length) return []

      return headers.filter(header => {
         const sampleValue = data[0][header]
         return !isNaN(sampleValue) && sampleValue !== null && sampleValue !== ''
      })
   }
}))

export default useExcelStore
