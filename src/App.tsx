import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Type,
  Image,
  Square,
  Layers,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Undo,
  Redo,
  Download,
  Smartphone,
  Monitor,
  Plus,
  Settings,
  Move,
  Lock,
  Unlock,
} from "lucide-react";

// Types
interface ElementStyle {
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  border?: string;
  width?: string;
  height?: string;
  textAlign?: string;
}

interface Element {
  defaultContent: string;
  id: string;
  type: "text" | "heading" | "button" | "image" | "container" | "divider";
  content: string;
  style: ElementStyle;
  position: { x: number; y: number };
  size: { width: number; height: number };
  locked: boolean;
  visible: boolean;
  zIndex: number;
}

interface HistoryState {
  elements: Element[];
  selectedElementId: string | null;
}

// Custom Hooks
const useHistory = (initialState: HistoryState) => {
  const [history, setHistory] = useState<HistoryState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pushState = useCallback(
    (state: HistoryState) => {
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(state);
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    },
    [history, currentIndex]
  );

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    currentState: history[currentIndex],
  };
};

// Component Library
const componentLibrary = [
  {
    type: "heading",
    icon: Type,
    label: "Heading",
    defaultContent: "Your Heading",
  },
  {
    type: "text",
    icon: Type,
    label: "Text",
    defaultContent: "Your text content goes here...",
  },
  { type: "button", icon: Square, label: "Button", defaultContent: "Click Me" },
  {
    type: "image",
    icon: Image,
    label: "Image",
    defaultContent: "https://via.placeholder.com/300x200",
  },
  { type: "container", icon: Square, label: "Container", defaultContent: "" },
  { type: "divider", icon: Square, label: "Divider", defaultContent: "" },
];

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const getDefaultStyle = (type: string): ElementStyle => {
  const baseStyles: Record<string, ElementStyle> = {
    heading: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#1f2937",
      margin: "16px 0",
      textAlign: "left",
    },
    text: {
      fontSize: "16px",
      color: "#374151",
      margin: "8px 0",
      textAlign: "left",
    },
    button: {
      backgroundColor: "#3b82f6",
      color: "white",
      padding: "12px 24px",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "500",
      border: "none",
    },
    image: {
      borderRadius: "8px",
      width: "300px",
      height: "200px",
    },
    container: {
      backgroundColor: "#f9fafb",
      padding: "24px",
      borderRadius: "8px",
      border: "2px dashed #d1d5db",
      width: "400px",
      height: "200px",
    },
    divider: {
      backgroundColor: "#e5e7eb",
      height: "2px",
      width: "100%",
      margin: "16px 0",
    },
  };
  return baseStyles[type] || {};
};

// Main Component
const WebsiteBuilder: React.FC = () => {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  const [draggedElement, setDraggedElement] = useState<
    Element | null | (typeof componentLibrary)[number]
  >(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [showLayers, setShowLayers] = useState(true);
  const [showProperties, setShowProperties] = useState(true);

  const canvasRef = useRef<HTMLDivElement>(null);
  const initialState = { elements: [], selectedElementId: null };
  const { pushState, undo, redo, canUndo, canRedo, currentState } =
    useHistory(initialState);

  // Sync with history
  useEffect(() => {
    if (currentState) {
      setElements(currentState.elements);
      setSelectedElementId(currentState.selectedElementId);
    }
  }, [currentState]);

  const saveToHistory = useCallback(
    (elementsToSave?: Element[], selectedId?: string | null) => {
      pushState({
        elements: elementsToSave || elements,
        selectedElementId:
          selectedId !== undefined ? selectedId : selectedElementId,
      });
    },
    [elements, selectedElementId, pushState]
  );

  const handleUndo = () => {
    const prevState = undo();
    if (prevState) {
      setElements(prevState.elements);
      setSelectedElementId(prevState.selectedElementId);
    }
  };

  const handleRedo = () => {
    const nextState = redo();
    if (nextState) {
      setElements(nextState.elements);
      setSelectedElementId(nextState.selectedElementId);
    }
  };

  const updateElement = useCallback(
    (id: string, updates: Partial<Element>) => {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
      );
      setTimeout(() => {
        setElements((current) => {
          saveToHistory(current, selectedElementId);
          return current;
        });
      }, 0);
    },
    [saveToHistory]
  );

  const deleteElement = useCallback(
    (id: string) => {
      setElements((prev) => prev.filter((el) => el.id !== id));
      if (selectedElementId === id) {
        setSelectedElementId(null);
      }
      setTimeout(() => {
        setElements((current) => {
          const newSelectedId =
            selectedElementId === id ? null : selectedElementId;
          saveToHistory(current, newSelectedId);
          return current;
        });
      }, 0);
    },
    [selectedElementId, saveToHistory]
  );

  const duplicateElement = useCallback(
    (id: string) => {
      const element = elements.find((el) => el.id === id);
      if (element) {
        const newElement = {
          ...element,
          id: generateId(),
          position: { x: element.position.x + 20, y: element.position.y + 20 },
          zIndex: elements.length,
        };
        setElements((prev) => [...prev, newElement]);
        setSelectedElementId(newElement.id);
        setTimeout(() => {
          setElements((current) => {
            saveToHistory(current, newElement.id);
            return current;
          });
        }, 0);
      }
    },
    [elements, saveToHistory]
  );

  const handleDragStart = (e: React.DragEvent, item: any) => {
    setDraggedElement(item);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (draggedElement && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if ("type" in draggedElement) {
        // Dragging from component library
        const newElement: Element = {
          id: generateId(),
          type: draggedElement.type as Element["type"],
          content: draggedElement.defaultContent,
          style: getDefaultStyle(draggedElement.type),
          position: { x, y },
          size: { width: 200, height: 50 },
          locked: false,
          visible: true,
          zIndex: elements.length,
          defaultContent: draggedElement.defaultContent,
        };

        const newElements = [...elements, newElement];
        setElements(newElements);
        setSelectedElementId(newElement.id);
        setTimeout(() => saveToHistory(newElements, newElement.id), 0);
      } else if (
        draggedElement &&
        typeof draggedElement === "object" &&
        "id" in draggedElement &&
        typeof (draggedElement as Element).id === "string"
      ) {
        // Dragging existing element
        updateElement((draggedElement as Element).id, {
          position: { x, y },
        });
      }
    }
    setDraggedElement(null);
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const exportCode = () => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { position: relative; min-height: 100vh; }
        ${elements
          .map(
            (el) => `
        .element-${el.id} {
            position: absolute;
            left: ${el.position.x}px;
            top: ${el.position.y}px;
            z-index: ${el.zIndex};
            ${Object.entries(el.style)
              .map(
                ([key, value]) =>
                  `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value};`
              )
              .join(" ")}
        }
        `
          )
          .join("")}
    </style>
</head>
<body>
    <div class="container">
        ${elements
          .map((el) => {
            switch (el.type) {
              case "heading":
                return `<h1 class="element-${el.id}">${el.content}</h1>`;
              case "text":
                return `<p class="element-${el.id}">${el.content}</p>`;
              case "button":
                return `<button class="element-${el.id}">${el.content}</button>`;
              case "image":
                return `<img class="element-${el.id}" src="${el.content}" alt="Image" />`;
              case "container":
                return `<div class="element-${el.id}"></div>`;
              case "divider":
                return `<hr class="element-${el.id}" />`;
              default:
                return "";
            }
          })
          .join("")}
    </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderElement = (element: Element) => {
    const isSelected = selectedElementId === element.id;
    const style: React.CSSProperties = {
      ...element.style,
      textAlign: element.style.textAlign as React.CSSProperties["textAlign"],
      position: "absolute",
      left: element.position.x,
      top: element.position.y,
      zIndex: element.zIndex,
      cursor: element.locked ? "not-allowed" : "move",
      opacity: element.visible ? 1 : 0.5,
      outline: isSelected ? "2px solid #3b82f6" : "none",
      outlineOffset: "2px",
    };

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!element.locked) {
        setSelectedElementId(element.id);
      }
    };

    const handleContentChange = (newContent: string) => {
      updateElement(element.id, { content: newContent });
    };

    const commonProps = {
      style,
      onClick: handleClick,
      draggable: !element.locked,
      onDragStart: (e: React.DragEvent) =>
        !element.locked && handleDragStart(e, element),
    };

    switch (element.type) {
      case "heading":
        return (
          <h1
            key={element.id}
            {...commonProps}
            contentEditable={!element.locked}
            suppressContentEditableWarning
            onBlur={(e) =>
              handleContentChange(e.currentTarget.textContent || "")
            }
          >
            {element.content}
          </h1>
        );
      case "text":
        return (
          <p
            key={element.id}
            {...commonProps}
            contentEditable={!element.locked}
            suppressContentEditableWarning
            onBlur={(e) =>
              handleContentChange(e.currentTarget.textContent || "")
            }
          >
            {element.content}
          </p>
        );
      case "button":
        return (
          <button
            key={element.id}
            {...commonProps}
            contentEditable={!element.locked}
            suppressContentEditableWarning
            onBlur={(e) =>
              handleContentChange(e.currentTarget.textContent || "")
            }
          >
            {element.content}
          </button>
        );
      case "image":
        return (
          <img
            key={element.id}
            {...commonProps}
            src={element.content}
            alt="Element"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/300x200?text=Image+Not+Found";
            }}
          />
        );
      case "container":
        return <div key={element.id} {...commonProps} />;
      case "divider":
        return <hr key={element.id} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Component Library */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Components</h2>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {componentLibrary.map((component) => {
            const IconComponent = component.icon;
            return (
              <div
                key={component.type}
                className="flex items-center p-3 bg-gray-50 rounded-lg cursor-grab hover:bg-gray-100 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, component)}
              >
                <IconComponent className="w-5 h-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {component.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed"
            >
              <Redo className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-300" />
            <button
              onClick={() =>
                setViewMode(viewMode === "desktop" ? "mobile" : "desktop")
              }
              className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {viewMode === "desktop" ? (
                <Monitor className="w-4 h-4" />
              ) : (
                <Smartphone className="w-4 h-4" />
              )}
              <span className="text-sm capitalize">{viewMode}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowLayers(!showLayers)}
              className={`p-2 rounded ${
                showLayers
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Layers className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowProperties(!showProperties)}
              className={`p-2 rounded ${
                showProperties
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={exportCode}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex">
          <div className="flex-1 p-8 overflow-auto">
            <div
              ref={canvasRef}
              className={`relative bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 transition-all ${
                isDragging ? "border-blue-400 bg-blue-50" : ""
              } ${
                viewMode === "mobile" ? "max-w-sm mx-auto" : "min-h-[800px]"
              }`}
              style={{ minHeight: "600px" }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => setSelectedElementId(null)}
            >
              {elements.map(renderElement)}
              {elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">
                      Drag components here to start building
                    </p>
                    <p className="text-sm">Your website canvas is ready</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Layers & Properties */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {showLayers && (
              <div className="border-b border-gray-200">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Layers
                  </h3>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {elements
                      .slice()
                      .reverse()
                      .map((element) => (
                        <div
                          key={element.id}
                          className={`flex items-center p-2 rounded cursor-pointer ${
                            selectedElementId === element.id
                              ? "bg-blue-100"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedElementId(element.id)}
                        >
                          <Move className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="flex-1 text-sm truncate">
                            {element.type} - {element.content.substring(0, 20)}
                            ...
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateElement(element.id, {
                                  visible: !element.visible,
                                });
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              {element.visible ? (
                                <Eye className="w-3 h-3" />
                              ) : (
                                <EyeOff className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateElement(element.id, {
                                  locked: !element.locked,
                                });
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              {element.locked ? (
                                <Lock className="w-3 h-3" />
                              ) : (
                                <Unlock className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateElement(element.id);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteElement(element.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {showProperties && selectedElement && (
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">
                  Properties
                </h3>

                <div className="space-y-4">
                  {/* Content */}
                  {selectedElement.type !== "divider" &&
                    selectedElement.type !== "container" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Content
                        </label>
                        <input
                          type="text"
                          value={selectedElement.content}
                          onChange={(e) =>
                            updateElement(selectedElement.id, {
                              content: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                  {/* Position */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        X Position
                      </label>
                      <input
                        type="number"
                        value={selectedElement.position.x}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            position: {
                              ...selectedElement.position,
                              x: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Y Position
                      </label>
                      <input
                        type="number"
                        value={selectedElement.position.y}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            position: {
                              ...selectedElement.position,
                              y: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Styling */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={selectedElement.style.backgroundColor || "#ffffff"}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          style: {
                            ...selectedElement.style,
                            backgroundColor: e.target.value,
                          },
                        })
                      }
                      className="w-full h-8 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={selectedElement.style.color || "#000000"}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          style: {
                            ...selectedElement.style,
                            color: e.target.value,
                          },
                        })
                      }
                      className="w-full h-8 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Font Size
                    </label>
                    <input
                      type="text"
                      value={selectedElement.style.fontSize || "16px"}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          style: {
                            ...selectedElement.style,
                            fontSize: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="16px"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Padding
                    </label>
                    <input
                      type="text"
                      value={selectedElement.style.padding || "0px"}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          style: {
                            ...selectedElement.style,
                            padding: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="8px"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Border Radius
                    </label>
                    <input
                      type="text"
                      value={selectedElement.style.borderRadius || "0px"}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          style: {
                            ...selectedElement.style,
                            borderRadius: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="4px"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteBuilder;
