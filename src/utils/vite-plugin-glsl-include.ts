// vite-plugin-glsl-include.ts
import fs from 'fs-extra'
import path from 'path'

// This is the plugin function for Vite
export default function glslIncludePlugin() {
  return {
    name: 'vite-plugin-glsl-include',

    transform(src: string, id: string) {
      // Only process GLSL files
      if (!id.endsWith('.glsl') && !id.endsWith('.vs') && !id.endsWith('.fs')) {
        return null
      }

      // Regular expression to find #include directives
      const includeRegex = /#include\s+"([^"]+)"/g

      // Replace the #include directives with the file contents
      let transformedSrc = src
      let match
      while ((match = includeRegex.exec(src)) !== null) {
        const includePath = match[1]
        const fullIncludePath = path.resolve(path.dirname(id), includePath)

        try {
          const includeContent = fs.readFileSync(fullIncludePath, 'utf-8')
          transformedSrc = transformedSrc.replace(match[0], includeContent)
        } catch (err) {
          console.error(`Failed to include ${includePath}:`, err)
        }
      }

      // Return the transformed GLSL code
      return {
        code: transformedSrc,
        map: null, // Optional: if you have source maps enabled
      }
    },
  }
}
