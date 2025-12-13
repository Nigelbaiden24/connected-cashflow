import { useEffect, useRef } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';

interface GrapesjsEditorProps {
  initialHtml: string;
  onSave?: (html: string, css: string) => void;
  height?: string;
}

export function GrapesjsEditor({ initialHtml, onSave, height = '100vh' }: GrapesjsEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    const editor = grapesjs.init({
      container: containerRef.current,
      height,
      width: 'auto',
      fromElement: false,
      storageManager: false,
      plugins: [gjsPresetWebpage],
      pluginsOpts: {
        [gjsPresetWebpage as any]: {
          blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video'],
          navbarOpts: false,
          countdownOpts: false,
          formsOpts: false,
        }
      },
      canvas: {
        styles: [],
        scripts: [],
      },
      blockManager: {
        appendTo: '.blocks-container',
      },
      styleManager: {
        sectors: [
          {
            name: 'General',
            open: true,
            buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom', 'z-index'],
          },
          {
            name: 'Dimension',
            open: false,
            buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
          },
          {
            name: 'Typography',
            open: false,
            buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration', 'text-shadow'],
          },
          {
            name: 'Decorations',
            open: false,
            buildProps: ['opacity', 'border-radius', 'border', 'box-shadow', 'background'],
          },
          {
            name: 'Extra',
            open: false,
            buildProps: ['transition', 'cursor', 'transform', 'overflow'],
          }
        ],
      },
      layerManager: {
        appendTo: '.layers-container',
      },
      traitManager: {
        appendTo: '.traits-container',
      },
      selectorManager: {
        appendTo: '.styles-container',
      },
      panels: {
        defaults: [
          {
            id: 'basic-actions',
            el: '.panel__basic-actions',
            buttons: [
              {
                id: 'visibility',
                active: true,
                className: 'btn-toggle-borders',
                label: '👁️',
                command: 'sw-visibility',
              },
              {
                id: 'fullscreen',
                className: 'btn-fullscreen',
                label: '⛶',
                command: 'fullscreen',
                context: 'fullscreen',
              },
              {
                id: 'undo',
                className: 'btn-undo',
                label: '↶',
                command: 'core:undo',
              },
              {
                id: 'redo',
                className: 'btn-redo',
                label: '↷',
                command: 'core:redo',
              },
              {
                id: 'clear-canvas',
                className: 'btn-clear',
                label: '🗑️',
                command: 'core:canvas-clear',
              },
              {
                id: 'save',
                className: 'btn-save',
                label: '💾',
                command: 'save-template',
                context: 'save-template',
              },
              {
                id: 'bg-color',
                className: 'btn-bg-color',
                label: '🎨',
                command: 'change-bg-color',
              },
            ],
          },
          {
            id: 'panel-devices',
            el: '.panel__devices',
            buttons: [
              {
                id: 'device-desktop',
                label: '🖥️',
                command: 'set-device-desktop',
                active: true,
                togglable: false,
              },
              {
                id: 'device-tablet',
                label: '📱',
                command: 'set-device-tablet',
                togglable: false,
              },
              {
                id: 'device-mobile',
                label: '📲',
                command: 'set-device-mobile',
                togglable: false,
              },
            ],
          },
        ],
      },
      deviceManager: {
        devices: [
          {
            name: 'Desktop',
            width: '',
          },
          {
            name: 'Tablet',
            width: '768px',
            widthMedia: '992px',
          },
          {
            name: 'Mobile',
            width: '320px',
            widthMedia: '480px',
          },
        ],
      },
    });

    // Custom Commands
    editor.Commands.add('save-template', {
      run: () => {
        const html = editor.getHtml();
        const css = editor.getCss();
        onSave?.(html, css);
      },
    });

    editor.Commands.add('set-device-desktop', {
      run: () => editor.setDevice('Desktop'),
    });
    editor.Commands.add('set-device-tablet', {
      run: () => editor.setDevice('Tablet'),
    });
    editor.Commands.add('set-device-mobile', {
      run: () => editor.setDevice('Mobile'),
    });

    editor.Commands.add('change-bg-color', {
      run: () => {
        const color = prompt('Enter background color (e.g., #ffffff, rgb(255,255,255), or white):', '#ffffff');
        if (color) {
          const wrapper = editor.getWrapper();
          wrapper?.setStyle({ 'background-color': color });
        }
      },
    });

    // Enhanced Custom Blocks
    const bm = editor.BlockManager;

    // Text Blocks
    bm.add('text-paragraph', {
      label: '📄 Paragraph',
      content: '<p style="padding: 10px; margin: 10px 0; line-height: 1.6;">Insert your text here. Double-click to edit.</p>',
      category: 'Text',
      attributes: { class: 'fa fa-paragraph' }
    });

    bm.add('heading-h1', {
      label: 'H1',
      content: '<h1 style="padding: 10px; margin: 15px 0; font-size: 2.5rem; font-weight: bold;">Main Heading</h1>',
      category: 'Text',
    });

    bm.add('heading-h2', {
      label: 'H2',
      content: '<h2 style="padding: 10px; margin: 12px 0; font-size: 2rem; font-weight: bold;">Sub Heading</h2>',
      category: 'Text',
    });

    bm.add('heading-h3', {
      label: 'H3',
      content: '<h3 style="padding: 10px; margin: 10px 0; font-size: 1.5rem; font-weight: 600;">Section Title</h3>',
      category: 'Text',
    });

    bm.add('quote-block', {
      label: '💬 Quote',
      content: '<blockquote style="padding: 20px 30px; margin: 20px 0; border-left: 4px solid #667eea; background: #f7fafc; font-style: italic; font-size: 1.1rem;">"Insert inspiring quote here"</blockquote>',
      category: 'Text',
    });

    // Layout Blocks
    bm.add('container', {
      label: '📦 Container',
      content: '<div style="max-width: 1200px; margin: 0 auto; padding: 20px;">Container Content</div>',
      category: 'Layout',
    });

    bm.add('section', {
      label: '📋 Section',
      content: '<section style="padding: 60px 20px; margin: 20px 0;"><h2>Section Title</h2><p>Section content goes here</p></section>',
      category: 'Layout',
    });

    bm.add('divider', {
      label: '➖ Divider',
      content: '<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 30px 0;">',
      category: 'Layout',
    });

    bm.add('spacer', {
      label: '⬜ Spacer',
      content: '<div style="height: 50px;"></div>',
      category: 'Layout',
    });

    // Card & Box Blocks
    bm.add('card', {
      label: '🎴 Card',
      content: `<div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 16px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); background: white;">
        <h3 style="margin: 0 0 12px 0; font-size: 1.5rem; font-weight: 700;">Card Title</h3>
        <p style="margin: 0; color: #64748b; line-height: 1.6;">Card content goes here. Add your information.</p>
      </div>`,
      category: 'Components',
    });

    bm.add('button', {
      label: '🔘 Button',
      content: '<button style="padding: 12px 32px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s;">Click Me</button>',
      category: 'Components',
    });

    bm.add('list-bullet', {
      label: '• List',
      content: `<ul style="padding-left: 20px; margin: 16px 0; line-height: 1.8;">
        <li>List item one</li>
        <li>List item two</li>
        <li>List item three</li>
      </ul>`,
      category: 'Components',
    });

    bm.add('list-numbered', {
      label: '1. Numbered',
      content: `<ol style="padding-left: 20px; margin: 16px 0; line-height: 1.8;">
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
      </ol>`,
      category: 'Components',
    });

    // Media Blocks
    bm.add('image-responsive', {
      label: '🖼️ Image',
      content: '<img src="https://via.placeholder.com/800x400" style="width: 100%; height: auto; border-radius: 8px; display: block;" alt="Placeholder"/>',
      category: 'Media',
    });

    bm.add('logo-upload', {
      label: '🏢 Logo',
      content: {
        type: 'image',
        style: {
          'max-width': '200px',
          'height': 'auto',
          'display': 'block',
          'margin': '20px auto',
        },
        attributes: {
          src: 'https://via.placeholder.com/200x80?text=Your+Logo',
          alt: 'Company Logo',
        },
        traits: [
          {
            type: 'button',
            label: 'Upload Logo',
            name: 'upload-logo',
            text: 'Choose File',
            full: true,
            command: (editor: Editor) => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e: any) => {
                const file = e.target?.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const selected = editor.getSelected();
                    if (selected && event.target?.result) {
                      selected.set('src', event.target.result as string);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }
          }
        ]
      },
      category: 'Media',
      attributes: { 
        title: 'Click the image and use Settings panel to upload your logo',
        class: 'logo-block'
      }
    });

    bm.add('video-embed', {
      label: '🎥 Video',
      content: '<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe></div>',
      category: 'Media',
    });

    // Table Blocks
    bm.add('table-basic', {
      label: '📊 Table 3x3',
      content: `<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f7fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 12px; text-align: left; font-weight: 600;">Header 1</th>
            <th style="padding: 12px; text-align: left; font-weight: 600;">Header 2</th>
            <th style="padding: 12px; text-align: left; font-weight: 600;">Header 3</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px;">Data 1</td>
            <td style="padding: 12px;">Data 2</td>
            <td style="padding: 12px;">Data 3</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px;">Data 4</td>
            <td style="padding: 12px;">Data 5</td>
            <td style="padding: 12px;">Data 6</td>
          </tr>
        </tbody>
      </table>`,
      category: 'Tables',
    });

    bm.add('table-2col', {
      label: '📋 Table 2x4',
      content: `<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #1e3a5f; color: white; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 14px; text-align: left; font-weight: 600;">Field</th>
            <th style="padding: 14px; text-align: left; font-weight: 600;">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px; font-weight: 500;">Row 1</td><td style="padding: 12px;">Value 1</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0; background: #f9fafb;"><td style="padding: 12px; font-weight: 500;">Row 2</td><td style="padding: 12px;">Value 2</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px; font-weight: 500;">Row 3</td><td style="padding: 12px;">Value 3</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0; background: #f9fafb;"><td style="padding: 12px; font-weight: 500;">Row 4</td><td style="padding: 12px;">Value 4</td></tr>
        </tbody>
      </table>`,
      category: 'Tables',
    });

    bm.add('table-4col', {
      label: '📑 Table 4x5',
      content: `<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: linear-gradient(135deg, #667eea, #764ba2); color: white;">
            <th style="padding: 14px; text-align: left; font-weight: 600;">Column 1</th>
            <th style="padding: 14px; text-align: left; font-weight: 600;">Column 2</th>
            <th style="padding: 14px; text-align: left; font-weight: 600;">Column 3</th>
            <th style="padding: 14px; text-align: left; font-weight: 600;">Column 4</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px;">Data</td><td style="padding: 12px;">Data</td><td style="padding: 12px;">Data</td><td style="padding: 12px;">Data</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0; background: #f9fafb;"><td style="padding: 12px;">Data</td><td style="padding: 12px;">Data</td><td style="padding: 12px;">Data</td><td style="padding: 12px;">Data</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px;">Data</td><td style="padding: 12px;">Data</td><td style="padding: 12px;">Data</td><td style="padding: 12px;">Data</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0; background: #f9fafb;"><td style="padding: 12px;">Data</td><td style="padding: 12px;">Data</td><td style="padding: 12px;">Data</td><td style="padding: 12px;">Data</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px;">Data</td><td style="padding: 12px;">Data</td><td style="padding: 12px;">Data</td><td style="padding: 12px;">Data</td></tr>
        </tbody>
      </table>`,
      category: 'Tables',
    });

    bm.add('table-financial', {
      label: '💰 Financial Table',
      content: `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #1e3a5f; color: white;">
            <th style="padding: 14px; text-align: left; font-weight: 600;">Description</th>
            <th style="padding: 14px; text-align: right; font-weight: 600;">Amount</th>
            <th style="padding: 14px; text-align: right; font-weight: 600;">%</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px;">Item 1</td><td style="padding: 12px; text-align: right; font-family: monospace;">£10,000</td><td style="padding: 12px; text-align: right;">25%</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0; background: #f9fafb;"><td style="padding: 12px;">Item 2</td><td style="padding: 12px; text-align: right; font-family: monospace;">£15,000</td><td style="padding: 12px; text-align: right;">37.5%</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px;">Item 3</td><td style="padding: 12px; text-align: right; font-family: monospace;">£15,000</td><td style="padding: 12px; text-align: right;">37.5%</td></tr>
          <tr style="background: #f1f5f9; font-weight: 700;"><td style="padding: 14px;">Total</td><td style="padding: 14px; text-align: right; font-family: monospace;">£40,000</td><td style="padding: 14px; text-align: right;">100%</td></tr>
        </tbody>
      </table>`,
      category: 'Tables',
    });

    bm.add('table-comparison', {
      label: '⚖️ Comparison Table',
      content: `<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #667eea; color: white;">
            <th style="padding: 14px; text-align: left; font-weight: 600;">Feature</th>
            <th style="padding: 14px; text-align: center; font-weight: 600;">Option A</th>
            <th style="padding: 14px; text-align: center; font-weight: 600;">Option B</th>
            <th style="padding: 14px; text-align: center; font-weight: 600;">Option C</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px; font-weight: 500;">Feature 1</td><td style="padding: 12px; text-align: center;">✓</td><td style="padding: 12px; text-align: center;">✓</td><td style="padding: 12px; text-align: center;">✓</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0; background: #f9fafb;"><td style="padding: 12px; font-weight: 500;">Feature 2</td><td style="padding: 12px; text-align: center;">✓</td><td style="padding: 12px; text-align: center;">—</td><td style="padding: 12px; text-align: center;">✓</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px; font-weight: 500;">Feature 3</td><td style="padding: 12px; text-align: center;">—</td><td style="padding: 12px; text-align: center;">✓</td><td style="padding: 12px; text-align: center;">✓</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0; background: #f9fafb;"><td style="padding: 12px; font-weight: 500;">Price</td><td style="padding: 12px; text-align: center; font-weight: 600;">£99</td><td style="padding: 12px; text-align: center; font-weight: 600;">£149</td><td style="padding: 12px; text-align: center; font-weight: 600;">£199</td></tr>
        </tbody>
      </table>`,
      category: 'Tables',
    });

    bm.add('table-striped', {
      label: '🦓 Striped Table',
      content: `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 14px; text-align: left; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Name</th>
            <th style="padding: 14px; text-align: left; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Status</th>
            <th style="padding: 14px; text-align: left; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Date</th>
            <th style="padding: 14px; text-align: right; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="padding: 12px;">Record 1</td><td style="padding: 12px;"><span style="background: #d1fae5; color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 12px;">Active</span></td><td style="padding: 12px;">01/01/2024</td><td style="padding: 12px; text-align: right;">£1,000</td></tr>
          <tr style="background: #f9fafb;"><td style="padding: 12px;">Record 2</td><td style="padding: 12px;"><span style="background: #fef3c7; color: #d97706; padding: 4px 12px; border-radius: 20px; font-size: 12px;">Pending</span></td><td style="padding: 12px;">02/01/2024</td><td style="padding: 12px; text-align: right;">£2,500</td></tr>
          <tr><td style="padding: 12px;">Record 3</td><td style="padding: 12px;"><span style="background: #d1fae5; color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 12px;">Active</span></td><td style="padding: 12px;">03/01/2024</td><td style="padding: 12px; text-align: right;">£750</td></tr>
        </tbody>
      </table>`,
      category: 'Tables',
    });

    bm.add('table-pricing', {
      label: '💵 Pricing Table',
      content: `<div style="display: flex; gap: 20px; margin: 20px 0; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center;">
          <h3 style="margin: 0 0 8px 0; color: #667eea;">Basic</h3>
          <div style="font-size: 32px; font-weight: 700; margin: 16px 0;">£29<span style="font-size: 14px; font-weight: 400; color: #6b7280;">/mo</span></div>
          <ul style="list-style: none; padding: 0; margin: 20px 0; text-align: left;">
            <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">✓ Feature 1</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">✓ Feature 2</li>
            <li style="padding: 8px 0; color: #9ca3af;">✗ Feature 3</li>
          </ul>
          <button style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">Select</button>
        </div>
        <div style="flex: 1; min-width: 200px; border: 2px solid #667eea; border-radius: 12px; padding: 24px; text-align: center; background: linear-gradient(to bottom, #f0f5ff, white);">
          <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">Popular</span>
          <h3 style="margin: 12px 0 8px 0; color: #667eea;">Pro</h3>
          <div style="font-size: 32px; font-weight: 700; margin: 16px 0;">£59<span style="font-size: 14px; font-weight: 400; color: #6b7280;">/mo</span></div>
          <ul style="list-style: none; padding: 0; margin: 20px 0; text-align: left;">
            <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">✓ Feature 1</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">✓ Feature 2</li>
            <li style="padding: 8px 0;">✓ Feature 3</li>
          </ul>
          <button style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">Select</button>
        </div>
      </div>`,
      category: 'Tables',
    });

    // Set initial content with wrapper
    const wrappedContent = `
      <div style="max-width: 1200px; margin: 0 auto; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        ${initialHtml}
      </div>
    `;
    
    editor.setComponents(wrappedContent);

    // Make all text elements editable by default
    editor.on('component:add', (component: any) => {
      if (component.get('type') === 'text' || component.get('tagName') === 'p' || 
          component.get('tagName')?.match(/^h[1-6]$/)) {
        component.set('editable', true);
      }
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [initialHtml, height, onSave]);

  return (
    <div className="grapesjs-editor-wrapper" style={{ height, width: '100%', position: 'relative' }}>
      <style>{`
        .grapesjs-editor-wrapper {
          height: ${height};
          width: 100%;
          position: relative;
        }
        
        /* Panel Styles */
        .panel__basic-actions {
          position: fixed !important;
          top: 80px;
          right: 30px;
          z-index: 1000;
          display: flex;
          gap: 8px;
          background: white;
          padding: 12px;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .panel__devices {
          position: fixed !important;
          top: 80px;
          left: 30px;
          z-index: 1000;
          display: flex;
          gap: 8px;
          background: white;
          padding: 12px;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        
        /* Button Styles */
        .panel__basic-actions button,
        .panel__devices button {
          padding: 10px 16px;
          border: none;
          background: #667eea;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.2s;
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .panel__basic-actions button:hover,
        .panel__devices button:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
        }
        .panel__basic-actions button.gjs-pn-active,
        .panel__devices button.gjs-pn-active {
          background: #4c51bf;
        }
        
        /* Side Panels */
        .blocks-container,
        .layers-container,
        .styles-container,
        .traits-container {
          background: white;
          border-radius: 8px;
          padding: 12px;
          overflow-y: auto;
          max-height: calc(100vh - 200px);
        }
        
        /* GrapesJS Theme Customization */
        .grapesjs-one-bg {
          background-color: #f8fafc;
        }
        .grapesjs-two-bg {
          background-color: white;
        }
        .grapesjs-three-bg {
          background-color: #667eea;
          color: white;
        }
        .grapesjs-four-bg {
          background-color: #5568d3;
        }
        .grapesjs-two-color {
          color: #667eea;
        }
        .grapesjs-three-color {
          color: white;
        }
        .grapesjs-four-color,
        .grapesjs-four-color-h:hover {
          color: #667eea;
        }
        
        /* Block Manager */
        .gjs-block {
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          transition: all 0.2s;
          padding: 12px;
          cursor: grab;
        }
        .gjs-block:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
          transform: translateY(-2px);
        }
        .gjs-block.gjs-bdrag {
          cursor: grabbing;
        }
        
        /* Canvas */
        .gjs-cv-canvas {
          background: #f1f5f9;
        }
        .gjs-frame {
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        
        /* Layer Manager */
        .gjs-layer {
          padding: 8px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .gjs-layer:hover {
          background: #f1f5f9;
        }
        .gjs-layer.gjs-selected {
          background: #e0e7ff;
        }
        
        /* Style Manager */
        .gjs-sm-sector {
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .gjs-sm-sector .gjs-sm-title {
          background: #f8fafc;
          padding: 10px 12px;
          border-radius: 6px;
          font-weight: 600;
        }
        .gjs-sm-property {
          padding: 8px 12px;
        }
        
        /* Toolbar */
        .gjs-toolbar {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border: 1px solid #e2e8f0;
        }
        .gjs-toolbar-item {
          padding: 6px 10px;
          transition: all 0.2s;
        }
        .gjs-toolbar-item:hover {
          background: #f1f5f9;
        }
        
        /* Resizer */
        .gjs-resizer-h,
        .gjs-resizer-w {
          background-color: #667eea;
        }
        
        /* Scrollbars */
        .blocks-container::-webkit-scrollbar,
        .layers-container::-webkit-scrollbar,
        .styles-container::-webkit-scrollbar,
        .traits-container::-webkit-scrollbar {
          width: 8px;
        }
        .blocks-container::-webkit-scrollbar-track,
        .layers-container::-webkit-scrollbar-track,
        .styles-container::-webkit-scrollbar-track,
        .traits-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .blocks-container::-webkit-scrollbar-thumb,
        .layers-container::-webkit-scrollbar-thumb,
        .styles-container::-webkit-scrollbar-thumb,
        .traits-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .blocks-container::-webkit-scrollbar-thumb:hover,
        .layers-container::-webkit-scrollbar-thumb:hover,
        .styles-container::-webkit-scrollbar-thumb:hover,
        .traits-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      
      <div className="panel__basic-actions"></div>
      <div className="panel__devices"></div>
      
      {/* Side Panels */}
      <div style={{
        position: 'fixed',
        left: '20px',
        top: '140px',
        width: '280px',
        maxHeight: 'calc(100vh - 160px)',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        padding: '16px',
        zIndex: 999,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#475569' }}>BLOCKS</h3>
          <div className="blocks-container" style={{ maxHeight: '300px', overflowY: 'auto' }}></div>
        </div>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#475569' }}>LAYERS</h3>
          <div className="layers-container" style={{ maxHeight: '200px', overflowY: 'auto' }}></div>
        </div>
      </div>
      
      <div style={{
        position: 'fixed',
        right: '20px',
        top: '140px',
        width: '280px',
        maxHeight: 'calc(100vh - 160px)',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        padding: '16px',
        zIndex: 999,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#475569' }}>STYLES</h3>
          <div className="styles-container" style={{ maxHeight: '400px', overflowY: 'auto' }}></div>
        </div>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#475569' }}>SETTINGS</h3>
          <div className="traits-container" style={{ maxHeight: '150px', overflowY: 'auto' }}></div>
        </div>
      </div>
      
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
