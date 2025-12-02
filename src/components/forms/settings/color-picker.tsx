'use client'
import React from 'react'
import { Paintbrush } from 'lucide-react'
import { UseFormSetValue } from 'react-hook-form'
import { DomainSettingsProps } from '@/schemas/settings.schema'

type ColorPickerProps = {
  defaultColor?: string
  setValue: UseFormSetValue<DomainSettingsProps>
}

const PRESET_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Green', value: '#10B981' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Indigo', value: '#6366F1' },
]

export const ColorPicker = ({ defaultColor = '#3B82F6', setValue }: ColorPickerProps) => {
  const [selectedColor, setSelectedColor] = React.useState(defaultColor)
  const [customColor, setCustomColor] = React.useState(defaultColor)

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    setCustomColor(color)
    setValue('chatbotColor', color, { shouldDirty: true })
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <Paintbrush className='h-4 w-4 text-slate-600 dark:text-slate-400' />
        <label className='text-sm font-medium text-slate-700 dark:text-slate-200'>
          Chatbot Color
        </label>
      </div>

      <div className='grid grid-cols-4 gap-3'>
        {PRESET_COLORS.map((color) => (
          <button
            key={color.value}
            type='button'
            onClick={() => handleColorChange(color.value)}
            className='group relative'
          >
            <div
              className={`h-12 w-full rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                selectedColor === color.value
                  ? 'border-slate-900 dark:border-white ring-2 ring-offset-2 ring-slate-900 dark:ring-white'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              style={{ backgroundColor: color.value }}
            />
            <span className='absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
              {color.name}
            </span>
          </button>
        ))}
      </div>

      <div className='flex items-center gap-3'>
        <div className='flex-1'>
          <input
            type='color'
            value={customColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className='w-full h-12 rounded-lg cursor-pointer border-2 border-slate-200 dark:border-slate-700'
          />
        </div>
        <div className='flex-1'>
          <input
            type='text'
            value={customColor}
            onChange={(e) => handleColorChange(e.target.value)}
            placeholder='#3B82F6'
            className='w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white'
          />
        </div>
      </div>

      <div className='flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'>
        <div
          className='h-8 w-8 rounded-full border-2 border-white shadow-md'
          style={{ backgroundColor: selectedColor }}
        />
        <span className='text-sm text-slate-600 dark:text-slate-300'>
          Selected Color: <span className='font-mono font-semibold'>{selectedColor}</span>
        </span>
      </div>
    </div>
  )
}