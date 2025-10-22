import { useEffect, useRef } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

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
      storageManager: false,
      blockManager: {
        appendTo: '.blocks-container',
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
                label: '<i class="fa fa-clone"></i>',
                command: 'sw-visibility',
              },
              {
                id: 'export',
                className: 'btn-export',
                label: '<i class="fa fa-code"></i>',
                command: 'export-template',
                context: 'export-template',
              },
              {
                id: 'save',
                className: 'btn-save',
                label: '<i class="fa fa-save"></i>',
                command: 'save-template',
                context: 'save-template',
              },
            ],
          },
          {
            id: 'panel-devices',
            el: '.panel__devices',
            buttons: [
              {
                id: 'device-desktop',
                label: '<i class="fa fa-desktop"></i>',
                command: 'set-device-desktop',
                active: true,
                togglable: false,
              },
              {
                id: 'device-tablet',
                label: '<i class="fa fa-tablet"></i>',
                command: 'set-device-tablet',
                togglable: false,
              },
              {
                id: 'device-mobile',
                label: '<i class="fa fa-mobile"></i>',
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
      styleManager: {
        sectors: [
          {
            name: 'General',
            open: true,
            buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
          },
          {
            name: 'Dimension',
            open: false,
            buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
          },
          {
            name: 'Typography',
            open: false,
            buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-shadow'],
          },
          {
            name: 'Decorations',
            open: false,
            buildProps: ['border-radius', 'background-color', 'border', 'box-shadow', 'background'],
          },
        ],
      },
      traitManager: {
        appendTo: '.traits-container',
      },
      layerManager: {
        appendTo: '.layers-container',
      },
    });

    // Add custom commands
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

    // Add custom blocks
    editor.BlockManager.add('text-block', {
      label: 'Text',
      content: '<div style="padding: 20px; font-size: 16px;">Insert your text here</div>',
      category: 'Basic',
    });

    editor.BlockManager.add('heading-block', {
      label: 'Heading',
      content: '<h2 style="padding: 10px; font-size: 24px; font-weight: bold;">Heading</h2>',
      category: 'Basic',
    });

    editor.BlockManager.add('image-block', {
      label: 'Image',
      content: '<img src="https://via.placeholder.com/350x250" style="width: 100%; height: auto;"/>',
      category: 'Media',
    });

    editor.BlockManager.add('2-columns', {
      label: '2 Columns',
      content: '<div style="display: flex; gap: 20px;"><div style="flex: 1; padding: 20px; background: #f5f5f5;">Column 1</div><div style="flex: 1; padding: 20px; background: #f5f5f5;">Column 2</div></div>',
      category: 'Layout',
    });

    editor.BlockManager.add('3-columns', {
      label: '3 Columns',
      content: '<div style="display: flex; gap: 15px;"><div style="flex: 1; padding: 15px; background: #f5f5f5;">Column 1</div><div style="flex: 1; padding: 15px; background: #f5f5f5;">Column 2</div><div style="flex: 1; padding: 15px; background: #f5f5f5;">Column 3</div></div>',
      category: 'Layout',
    });

    // Set initial content
    editor.setComponents(initialHtml);

    editorRef.current = editor;

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [initialHtml, height, onSave]);

  return (
    <div className="grapesjs-editor-wrapper">
      <style>{`
        .grapesjs-editor-wrapper {
          height: ${height};
          width: 100%;
        }
        .panel__basic-actions {
          position: fixed;
          top: 70px;
          right: 20px;
          z-index: 10;
          display: flex;
          gap: 5px;
          background: white;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .panel__devices {
          position: fixed;
          top: 70px;
          left: 20px;
          z-index: 10;
          display: flex;
          gap: 5px;
          background: white;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .btn-toggle-borders, .btn-export, .btn-save {
          padding: 10px 15px;
          border: none;
          background: #667eea;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .btn-toggle-borders:hover, .btn-export:hover, .btn-save:hover {
          background: #5568d3;
        }
        .grapesjs-one-bg {
          background-color: #f8f9fa;
        }
        .grapesjs-two-color {
          color: #667eea;
        }
        .grapesjs-three-bg {
          background-color: #667eea;
          color: white;
        }
        .grapesjs-four-color, .grapesjs-four-color-h:hover {
          color: #667eea;
        }
      `}</style>
      <div className="panel__basic-actions"></div>
      <div className="panel__devices"></div>
      <div ref={containerRef} />
    </div>
  );
}
