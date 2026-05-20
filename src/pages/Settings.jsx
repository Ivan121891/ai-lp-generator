import { useState } from 'react'
import { useApp } from '../contexts/AppContext'

export default function Settings() {
  const { apiKey, setApiKey, settings, setSettings } = useApp()
  const [localKey, setLocalKey] = useState(apiKey)
  const [saved, setSaved] = useState(false)

  const handleSaveKey = () => {
    setApiKey(localKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-3xl animate-fade-in">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {/* API Key */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">OpenRouter API Key</h2>
        <p className="text-xs text-gray-400 mb-4">
          Your key is stored locally in your browser. Never shared.
          Get one at{' '}
          <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-[#d85a30] hover:underline">
            openrouter.ai/keys
          </a>
        </p>

        <div className="flex gap-3">
          <input
            type="password"
            value={localKey}
            onChange={e => setLocalKey(e.target.value)}
            placeholder="sk-or-v1-..."
            className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm font-mono focus:outline-none focus:border-[#d85a30]"
          />
          <button
            onClick={handleSaveKey}
            className="bg-[#d85a30] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#c04e28] transition-colors cursor-pointer shrink-0"
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Default model */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Default Model</h2>
        <p className="text-xs text-gray-400 mb-4">
          The AI model used to generate landing pages
        </p>
        <select
          value={settings.model}
          onChange={e => setSettings({ ...settings, model: e.target.value })}
          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#d85a30]"
        >
          <option value="openai/gpt-4o-mini">GPT-4o Mini (fast, cheap)</option>
          <option value="openai/gpt-4o">GPT-4o (high quality)</option>
          <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
          <option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash</option>
          <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B</option>
        </select>
      </div>

      {/* Default style */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Default Styles</h2>
        <p className="text-xs text-gray-400 mb-4">
          These are applied to new pages by default
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Accent color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.accentColor}
                onChange={e => setSettings({ ...settings, accentColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <span className="text-xs text-gray-500 font-mono">{settings.accentColor}</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Accent text</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.accentTextColor}
                onChange={e => setSettings({ ...settings, accentTextColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <span className="text-xs text-gray-500 font-mono">{settings.accentTextColor}</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.bgColor}
                onChange={e => setSettings({ ...settings, bgColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <span className="text-xs text-gray-500 font-mono">{settings.bgColor}</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Text</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.textColor}
                onChange={e => setSettings({ ...settings, textColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <span className="text-xs text-gray-500 font-mono">{settings.textColor}</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Corner radius</label>
            <input
              type="range"
              min="0"
              max="24"
              value={settings.cornerRadius}
              onChange={e => setSettings({ ...settings, cornerRadius: Number(e.target.value) })}
              className="w-full accent-[#d85a30]"
            />
            <div className="text-xs text-gray-500 font-mono mt-1">{settings.cornerRadius}px</div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Heading font</label>
            <select
              value={settings.headingFont}
              onChange={e => setSettings({ ...settings, headingFont: e.target.value })}
              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#d85a30]"
            >
              <option value="Inter">Inter</option>
              <option value="Space Grotesk">Space Grotesk</option>
              <option value="DM Serif Display">DM Serif Display</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Lora">Lora</option>
              <option value="Manrope">Manrope</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}