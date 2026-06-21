import { useState, type FormEvent, type RefObject } from 'react'

interface Props {
  onSubmit: (word: string) => void
  disabled?: boolean
  inputRef?: RefObject<HTMLInputElement | null>
}

export function WordInput({ onSubmit, disabled, inputRef }: Props) {
  const [value, setValue] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const word = value.trim()
    if (word) {
      onSubmit(word)
      setValue('')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 360 }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Type an English word…"
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        style={{
          flex: 1,
          padding: '13px 16px',
          borderRadius: 14,
          border: '2px solid #e0d7ff',
          fontSize: 16,
          outline: 'none',
          background: '#fff',
          color: '#1a1a2e',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = '#7c3aed'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = '#e0d7ff'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        style={{
          padding: '13px 22px',
          borderRadius: 14,
          border: 'none',
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          color: '#fff',
          fontWeight: 800,
          fontSize: 15,
          cursor: disabled || !value.trim() ? 'default' : 'pointer',
          opacity: disabled || !value.trim() ? 0.5 : 1,
          transition: 'opacity 0.2s, transform 0.1s',
          boxShadow: '0 4px 12px rgba(124,58,237,0.30)',
        }}
        onMouseDown={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)' }}
        onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
      >
        Feed!
      </button>
    </form>
  )
}
