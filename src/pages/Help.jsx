import { Link } from 'react-router-dom'

export default function Help() {
  return (
    <div className="p-8 max-w-3xl animate-fade-in">
      <h1 className="text-2xl font-bold mb-8">Help</h1>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Getting Started</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>AI LP Generator</strong> lets you create beautiful landing pages from a simple text
              prompt. Just describe what you want, and the AI generates a complete HTML page with Tailwind CSS.
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to <Link to="/settings" className="text-[#d85a30] hover:underline">Settings</Link> and add your OpenRouter API key</li>
              <li>Go to <Link to="/pages" className="text-[#d85a30] hover:underline">Pages</Link> and click "New page"</li>
              <li>Describe your landing page — e.g. "A modern spa landing page with hero, services, and booking CTA"</li>
              <li>Wait ~10-20 seconds for the AI to generate your page</li>
              <li>View the preview, tweak the style, or regenerate with a refined prompt</li>
            </ol>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Tips for Better Prompts</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <ul className="space-y-2">
              <li><strong>Be specific</strong> — "A landing page for a vegan bakery with a hero image of croissants, a menu section, customer testimonials, and an order CTA"</li>
              <li><strong>Mention sections</strong> — List what sections you want: hero, features, pricing, FAQ, testimonials, contact form, footer</li>
              <li><strong>Describe the vibe</strong> — "Modern and clean", "Luxury and elegant", "Bold and playful", "Minimalist"</li>
              <li><strong>Specify the audience</strong> — "For busy professionals", "For luxury spa clients", "For SaaS startups"</li>
            </ul>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Page Editor</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              The page editor has three tabs:
            </p>
            <ul className="space-y-1">
              <li><strong>Content</strong> — Edit the page title and emoji, view the prompt used</li>
              <li><strong>Style</strong> — Change accent color, background, text color, and corner radius</li>
              <li><strong>Prompt</strong> — Edit and regenerate the page with a new prompt</li>
            </ul>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Need a different model?</h2>
          <div className="text-sm text-gray-600">
            Go to <Link to="/settings" className="text-[#d85a30] hover:underline">Settings</Link> to
            switch between GPT-4o Mini (fast, cheap), GPT-4o (high quality), Claude 3.5 Sonnet,
            Gemini 2.0 Flash, or Llama 3.3 70B.
          </div>
        </div>
      </div>
    </div>
  )
}