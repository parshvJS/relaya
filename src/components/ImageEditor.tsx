import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useImageHistory, ImageState } from '@/hooks/useImageHistory';
import { 
  X, 
  Download, 
  RotateCcw, 
  Crop, 
  Palette, 
  Type,
  Check,
  Loader2,
  Move,
  Undo2,
  Redo2,
  RotateCw,
  Maximize2
} from 'lucide-react';

interface ImageEditorProps {
  imageUrl: string;
  onClose: () => void;
  onSave?: (editedImageUrl: string) => void;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageEditor = ({ imageUrl, onClose, onSave }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // History management
  const initialState: ImageState = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    textOverlays: [],
  };
  
  const {
    currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  } = useImageHistory(initialState);
  
  // Extract current values from history state
  const { brightness, contrast, saturation, blur, grayscale, sepia, textOverlays } = currentState;
  
  // Text input states (not part of history)
  const [newText, setNewText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [initialTransform, setInitialTransform] = useState<{
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    mouseX: number;
    mouseY: number;
  } | null>(null);
  
  // Crop states
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  
  // Canvas dimensions
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  
  // Helper to update state and push to history
  const updateState = useCallback((updates: Partial<ImageState>) => {
    pushState({ ...currentState, ...updates });
  }, [currentState, pushState]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalImage(img);
      setIsLoading(false);
      
      // Calculate canvas dimensions to fit container
      const maxWidth = 800;
      const maxHeight = 500;
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      setCanvasDimensions({ width, height });
    };
    img.onerror = () => {
      setIsLoading(false);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Render canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !originalImage) return;

    canvas.width = canvasDimensions.width;
    canvas.height = canvasDimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply filters
    ctx.filter = `
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturation}%)
      blur(${blur}px)
      grayscale(${grayscale}%)
      sepia(${sepia}%)
    `;

    // Draw image
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    // Reset filter for text
    ctx.filter = 'none';

    // Draw text overlays
    textOverlays.forEach((overlay) => {
      ctx.save();
      
      // Measure text at base size for calculations
      ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
      const metrics = ctx.measureText(overlay.text);
      const textWidth = metrics.width * (overlay.scaleX || 1);
      const textHeight = overlay.fontSize * (overlay.scaleY || 1);
      
      // Calculate center point for rotation
      const centerX = overlay.x + textWidth / 2;
      const centerY = overlay.y + textHeight / 2;
      
      // Apply transformations
      ctx.translate(centerX, centerY);
      ctx.rotate((overlay.rotation || 0) * Math.PI / 180);
      ctx.scale(overlay.scaleX || 1, overlay.scaleY || 1);
      ctx.translate(-metrics.width / 2, -overlay.fontSize / 2);
      
      ctx.fillStyle = overlay.color;
      ctx.textBaseline = 'top';
      
      // Add text shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.fillText(overlay.text, 0, 0);
      
      ctx.restore();
      
      // Draw selection border and handles if selected
      if (overlay.id === selectedTextId) {
        const baseMetrics = ctx.measureText(overlay.text);
        const baseWidth = baseMetrics.width;
        const baseHeight = overlay.fontSize;
        const scaledWidth = baseWidth * (overlay.scaleX || 1);
        const scaledHeight = baseHeight * (overlay.scaleY || 1);
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((overlay.rotation || 0) * Math.PI / 180);
        
        // Draw selection border
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-scaledWidth / 2 - 4, -scaledHeight / 2 - 4, scaledWidth + 8, scaledHeight + 8);
        ctx.setLineDash([]);
        
        // Draw resize handles (corners)
        const handleSize = 8;
        ctx.fillStyle = '#3b82f6';
        const corners = [
          { x: -scaledWidth / 2 - 4, y: -scaledHeight / 2 - 4, handle: 'nw' },
          { x: scaledWidth / 2 + 4 - handleSize, y: -scaledHeight / 2 - 4, handle: 'ne' },
          { x: -scaledWidth / 2 - 4, y: scaledHeight / 2 + 4 - handleSize, handle: 'sw' },
          { x: scaledWidth / 2 + 4 - handleSize, y: scaledHeight / 2 + 4 - handleSize, handle: 'se' },
        ];
        corners.forEach(corner => {
          ctx.fillRect(corner.x, corner.y, handleSize, handleSize);
        });
        
        // Draw rotation handle (top center)
        ctx.beginPath();
        ctx.arc(0, -scaledHeight / 2 - 25, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw line to rotation handle
        ctx.beginPath();
        ctx.moveTo(0, -scaledHeight / 2 - 4);
        ctx.lineTo(0, -scaledHeight / 2 - 19);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
      }
    });

    // Draw crop area
    if (isCropping && cropArea) {
      // Darken outside crop area
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, cropArea.y);
      ctx.fillRect(0, cropArea.y, cropArea.x, cropArea.height);
      ctx.fillRect(cropArea.x + cropArea.width, cropArea.y, canvas.width - cropArea.x - cropArea.width, cropArea.height);
      ctx.fillRect(0, cropArea.y + cropArea.height, canvas.width, canvas.height - cropArea.y - cropArea.height);
      
      // Draw crop border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      
      // Draw corner handles
      const handleSize = 10;
      ctx.fillStyle = '#ffffff';
      const corners = [
        { x: cropArea.x, y: cropArea.y },
        { x: cropArea.x + cropArea.width, y: cropArea.y },
        { x: cropArea.x, y: cropArea.y + cropArea.height },
        { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height },
      ];
      corners.forEach(corner => {
        ctx.fillRect(corner.x - handleSize/2, corner.y - handleSize/2, handleSize, handleSize);
      });
    }
  }, [originalImage, canvasDimensions, brightness, contrast, saturation, blur, grayscale, sepia, textOverlays, selectedTextId, isCropping, cropArea]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleAddText = () => {
    if (!newText.trim()) return;
    
    const newOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: newText,
      x: 50,
      y: 50,
      fontSize,
      color: textColor,
      fontFamily,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
    
    updateState({ textOverlays: [...textOverlays, newOverlay] });
    setNewText('');
    setSelectedTextId(newOverlay.id);
  };

  const handleDeleteSelectedText = () => {
    if (!selectedTextId) return;
    updateState({ textOverlays: textOverlays.filter(t => t.id !== selectedTextId) });
    setSelectedTextId(null);
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);
    
    if (isCropping) {
      setCropStart({ x, y });
      setCropArea({ x, y, width: 0, height: 0 });
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    // Check if clicking on handles of selected overlay first
    if (selectedTextId) {
      const overlay = textOverlays.find(t => t.id === selectedTextId);
      if (overlay) {
        ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
        const metrics = ctx.measureText(overlay.text);
        const baseWidth = metrics.width;
        const baseHeight = overlay.fontSize;
        const scaledWidth = baseWidth * (overlay.scaleX || 1);
        const scaledHeight = baseHeight * (overlay.scaleY || 1);
        const centerX = overlay.x + scaledWidth / 2;
        const centerY = overlay.y + scaledHeight / 2;
        
        // Transform click coordinates to overlay's local space
        const dx = x - centerX;
        const dy = y - centerY;
        const rotation = (overlay.rotation || 0) * Math.PI / 180;
        const localX = dx * Math.cos(-rotation) - dy * Math.sin(-rotation);
        const localY = dx * Math.sin(-rotation) + dy * Math.cos(-rotation);
        
        // Check rotation handle (top center)
        const rotateHandleY = -scaledHeight / 2 - 25;
        if (Math.abs(localX) < 10 && Math.abs(localY - rotateHandleY) < 10) {
          setIsRotating(true);
          setInitialTransform({
            x: overlay.x,
            y: overlay.y,
            scaleX: overlay.scaleX || 1,
            scaleY: overlay.scaleY || 1,
            rotation: overlay.rotation || 0,
            mouseX: x,
            mouseY: y,
          });
          return;
        }
        
        // Check resize handles
        const handleSize = 12;
        const corners = [
          { x: -scaledWidth / 2 - 4, y: -scaledHeight / 2 - 4, handle: 'nw' },
          { x: scaledWidth / 2 + 4 - handleSize, y: -scaledHeight / 2 - 4, handle: 'ne' },
          { x: -scaledWidth / 2 - 4, y: scaledHeight / 2 + 4 - handleSize, handle: 'sw' },
          { x: scaledWidth / 2 + 4 - handleSize, y: scaledHeight / 2 + 4 - handleSize, handle: 'se' },
        ];
        
        for (const corner of corners) {
          if (localX >= corner.x && localX <= corner.x + handleSize &&
              localY >= corner.y && localY <= corner.y + handleSize) {
            setIsResizing(true);
            setResizeHandle(corner.handle);
            setInitialTransform({
              x: overlay.x,
              y: overlay.y,
              scaleX: overlay.scaleX || 1,
              scaleY: overlay.scaleY || 1,
              rotation: overlay.rotation || 0,
              mouseX: x,
              mouseY: y,
            });
            return;
          }
        }
      }
    }
    
    // Check if clicking on a text overlay body
    for (let i = textOverlays.length - 1; i >= 0; i--) {
      const overlay = textOverlays[i];
      ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
      const metrics = ctx.measureText(overlay.text);
      const baseWidth = metrics.width;
      const baseHeight = overlay.fontSize;
      const scaledWidth = baseWidth * (overlay.scaleX || 1);
      const scaledHeight = baseHeight * (overlay.scaleY || 1);
      const centerX = overlay.x + scaledWidth / 2;
      const centerY = overlay.y + scaledHeight / 2;
      
      // Transform click coordinates to overlay's local space
      const dx = x - centerX;
      const dy = y - centerY;
      const rotation = (overlay.rotation || 0) * Math.PI / 180;
      const localX = dx * Math.cos(-rotation) - dy * Math.sin(-rotation);
      const localY = dx * Math.sin(-rotation) + dy * Math.cos(-rotation);
      
      if (
        Math.abs(localX) <= scaledWidth / 2 + 4 &&
        Math.abs(localY) <= scaledHeight / 2 + 4
      ) {
        setSelectedTextId(overlay.id);
        setIsDragging(true);
        setDragOffset({ x: x - overlay.x, y: y - overlay.y });
        return;
      }
    }
    
    setSelectedTextId(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);
    
    if (isCropping && cropStart) {
      setCropArea({
        x: Math.min(x, cropStart.x),
        y: Math.min(y, cropStart.y),
        width: Math.abs(x - cropStart.x),
        height: Math.abs(y - cropStart.y),
      });
      return;
    }
    
    if (isRotating && selectedTextId && initialTransform) {
      const overlay = textOverlays.find(t => t.id === selectedTextId);
      if (overlay) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;
        
        ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
        const metrics = ctx.measureText(overlay.text);
        const scaledWidth = metrics.width * (overlay.scaleX || 1);
        const scaledHeight = overlay.fontSize * (overlay.scaleY || 1);
        const centerX = overlay.x + scaledWidth / 2;
        const centerY = overlay.y + scaledHeight / 2;
        
        // Calculate angle from center to mouse
        const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI + 90;
        
        const updatedOverlays = textOverlays.map(o =>
          o.id === selectedTextId
            ? { ...o, rotation: angle }
            : o
        );
        pushState({ ...currentState, textOverlays: updatedOverlays });
      }
      return;
    }
    
    if (isResizing && selectedTextId && initialTransform && resizeHandle) {
      const overlay = textOverlays.find(t => t.id === selectedTextId);
      if (overlay) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;
        
        ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
        const metrics = ctx.measureText(overlay.text);
        const baseWidth = metrics.width;
        const baseHeight = overlay.fontSize;
        const scaledWidth = baseWidth * initialTransform.scaleX;
        const scaledHeight = baseHeight * initialTransform.scaleY;
        const centerX = overlay.x + scaledWidth / 2;
        const centerY = overlay.y + scaledHeight / 2;
        
        // Transform mouse delta to local space
        const dx = x - initialTransform.mouseX;
        const dy = y - initialTransform.mouseY;
        const rotation = (overlay.rotation || 0) * Math.PI / 180;
        const localDx = dx * Math.cos(-rotation) - dy * Math.sin(-rotation);
        const localDy = dx * Math.sin(-rotation) + dy * Math.cos(-rotation);
        
        let newScaleX = initialTransform.scaleX;
        let newScaleY = initialTransform.scaleY;
        
        // Calculate scale factor based on handle
        const scaleFactor = 0.01;
        if (resizeHandle.includes('e')) {
          newScaleX = Math.max(0.2, initialTransform.scaleX + localDx * scaleFactor);
        }
        if (resizeHandle.includes('w')) {
          newScaleX = Math.max(0.2, initialTransform.scaleX - localDx * scaleFactor);
        }
        if (resizeHandle.includes('s')) {
          newScaleY = Math.max(0.2, initialTransform.scaleY + localDy * scaleFactor);
        }
        if (resizeHandle.includes('n')) {
          newScaleY = Math.max(0.2, initialTransform.scaleY - localDy * scaleFactor);
        }
        
        const updatedOverlays = textOverlays.map(o =>
          o.id === selectedTextId
            ? { ...o, scaleX: newScaleX, scaleY: newScaleY }
            : o
        );
        pushState({ ...currentState, textOverlays: updatedOverlays });
      }
      return;
    }
    
    if (isDragging && selectedTextId) {
      const updatedOverlays = textOverlays.map(overlay => 
        overlay.id === selectedTextId
          ? { ...overlay, x: x - dragOffset.x, y: y - dragOffset.y }
          : overlay
      );
      pushState({ ...currentState, textOverlays: updatedOverlays });
    }
  };

  const handleCanvasMouseUp = () => {
    if (isCropping) {
      setCropStart(null);
    }
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setResizeHandle(null);
    setInitialTransform(null);
  };

  const applyCrop = () => {
    if (!cropArea || !originalImage) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a temporary canvas for the cropped image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    // Scale crop coordinates to original image dimensions
    const scaleX = originalImage.width / canvasDimensions.width;
    const scaleY = originalImage.height / canvasDimensions.height;
    
    const scaledCrop = {
      x: cropArea.x * scaleX,
      y: cropArea.y * scaleY,
      width: cropArea.width * scaleX,
      height: cropArea.height * scaleY,
    };
    
    tempCanvas.width = scaledCrop.width;
    tempCanvas.height = scaledCrop.height;
    
    // Apply filters
    tempCtx.filter = `
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturation}%)
      blur(${blur}px)
      grayscale(${grayscale}%)
      sepia(${sepia}%)
    `;
    
    tempCtx.drawImage(
      originalImage,
      scaledCrop.x, scaledCrop.y, scaledCrop.width, scaledCrop.height,
      0, 0, scaledCrop.width, scaledCrop.height
    );
    
    // Create new image from cropped canvas
    const newImg = new Image();
    newImg.onload = () => {
      setOriginalImage(newImg);
      
      // Recalculate canvas dimensions
      const maxWidth = 800;
      const maxHeight = 500;
      let width = newImg.width;
      let height = newImg.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      setCanvasDimensions({ width, height });
      setIsCropping(false);
      setCropArea(null);
      
      // Reset filters after crop and reset history
      resetHistory({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        textOverlays: [],
      });
    };
    newImg.src = tempCanvas.toDataURL('image/png');
  };

  const resetFilters = () => {
    updateState({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
    });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a full-resolution canvas for export
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx || !originalImage) return;
    
    exportCanvas.width = originalImage.width;
    exportCanvas.height = originalImage.height;
    
    // Apply filters
    exportCtx.filter = `
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturation}%)
      blur(${blur}px)
      grayscale(${grayscale}%)
      sepia(${sepia}%)
    `;
    
    exportCtx.drawImage(originalImage, 0, 0);
    
    // Reset filter for text
    exportCtx.filter = 'none';
    
    // Scale text overlays to original image size
    const scaleX = originalImage.width / canvasDimensions.width;
    const scaleY = originalImage.height / canvasDimensions.height;
    
    textOverlays.forEach((overlay) => {
      exportCtx.save();
      
      const scaledFontSize = overlay.fontSize * scaleY;
      exportCtx.font = `${scaledFontSize}px ${overlay.fontFamily}`;
      const metrics = exportCtx.measureText(overlay.text);
      const textWidth = metrics.width * (overlay.scaleX || 1);
      const textHeight = scaledFontSize * (overlay.scaleY || 1);
      
      const centerX = overlay.x * scaleX + textWidth / 2;
      const centerY = overlay.y * scaleY + textHeight / 2;
      
      exportCtx.translate(centerX, centerY);
      exportCtx.rotate((overlay.rotation || 0) * Math.PI / 180);
      exportCtx.scale(overlay.scaleX || 1, overlay.scaleY || 1);
      exportCtx.translate(-metrics.width / 2, -scaledFontSize / 2);
      
      exportCtx.fillStyle = overlay.color;
      exportCtx.textBaseline = 'top';
      exportCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      exportCtx.shadowBlur = 4 * scaleY;
      exportCtx.shadowOffsetX = 2 * scaleX;
      exportCtx.shadowOffsetY = 2 * scaleY;
      exportCtx.fillText(overlay.text, 0, 0);
      
      exportCtx.restore();
    });
    
    const link = document.createElement('a');
    link.download = `edited-image-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onSave) return;
    
    // Create full-resolution export
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx || !originalImage) return;
    
    exportCanvas.width = originalImage.width;
    exportCanvas.height = originalImage.height;
    
    exportCtx.filter = `
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturation}%)
      blur(${blur}px)
      grayscale(${grayscale}%)
      sepia(${sepia}%)
    `;
    
    exportCtx.drawImage(originalImage, 0, 0);
    exportCtx.filter = 'none';
    
    const scaleX = originalImage.width / canvasDimensions.width;
    const scaleY = originalImage.height / canvasDimensions.height;
    
    textOverlays.forEach((overlay) => {
      exportCtx.save();
      
      const scaledFontSize = overlay.fontSize * scaleY;
      exportCtx.font = `${scaledFontSize}px ${overlay.fontFamily}`;
      const metrics = exportCtx.measureText(overlay.text);
      const textWidth = metrics.width * (overlay.scaleX || 1);
      const textHeight = scaledFontSize * (overlay.scaleY || 1);
      
      const centerX = overlay.x * scaleX + textWidth / 2;
      const centerY = overlay.y * scaleY + textHeight / 2;
      
      exportCtx.translate(centerX, centerY);
      exportCtx.rotate((overlay.rotation || 0) * Math.PI / 180);
      exportCtx.scale(overlay.scaleX || 1, overlay.scaleY || 1);
      exportCtx.translate(-metrics.width / 2, -scaledFontSize / 2);
      
      exportCtx.fillStyle = overlay.color;
      exportCtx.textBaseline = 'top';
      exportCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      exportCtx.shadowBlur = 4 * scaleY;
      exportCtx.shadowOffsetX = 2 * scaleX;
      exportCtx.shadowOffsetY = 2 * scaleY;
      exportCtx.fillText(overlay.text, 0, 0);
      
      exportCtx.restore();
    });
    
    onSave(exportCanvas.toDataURL('image/png'));
  };

  const filterPresets = [
    { name: 'Original', filters: { brightness: 100, contrast: 100, saturation: 100, grayscale: 0, sepia: 0 } },
    { name: 'Vivid', filters: { brightness: 110, contrast: 120, saturation: 130, grayscale: 0, sepia: 0 } },
    { name: 'Muted', filters: { brightness: 100, contrast: 90, saturation: 70, grayscale: 0, sepia: 0 } },
    { name: 'B&W', filters: { brightness: 100, contrast: 110, saturation: 100, grayscale: 100, sepia: 0 } },
    { name: 'Vintage', filters: { brightness: 110, contrast: 90, saturation: 80, grayscale: 0, sepia: 40 } },
    { name: 'Cool', filters: { brightness: 100, contrast: 100, saturation: 90, grayscale: 0, sepia: 0 } },
  ];

  const applyPreset = (preset: typeof filterPresets[0]) => {
    updateState({
      brightness: preset.filters.brightness,
      contrast: preset.filters.contrast,
      saturation: preset.filters.saturation,
      grayscale: preset.filters.grayscale,
      sepia: preset.filters.sepia,
    });
  };

  return (
    <TooltipProvider>
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <Card className="w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between py-3 border-b">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">Image Editor</CardTitle>
              {/* Undo/Redo buttons */}
              <div className="flex items-center gap-1 ml-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={undo}
                      disabled={!canUndo}
                      className="h-8 w-8"
                    >
                      <Undo2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Undo (Ctrl+Z)</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={redo}
                      disabled={!canRedo}
                      className="h-8 w-8"
                    >
                      <Redo2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Redo (Ctrl+Y)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              {onSave && (
                <Button size="sm" onClick={handleSave}>
                  <Check className="w-4 h-4 mr-1" />
                  Save
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        
        <CardContent className="flex-1 overflow-auto p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Canvas Area */}
            <div 
              ref={containerRef}
              className="flex-1 flex items-center justify-center bg-muted/50 rounded-lg p-4 min-h-[400px]"
            >
              {isLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading image...</p>
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  className={`max-w-full max-h-full rounded shadow-lg ${
                    isCropping ? 'cursor-crosshair' : 
                    isRotating ? 'cursor-grabbing' :
                    isResizing ? 'cursor-nwse-resize' :
                    isDragging ? 'cursor-grabbing' : 
                    'cursor-default'
                  }`}
                  style={{ width: canvasDimensions.width, height: canvasDimensions.height }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
              )}
            </div>
            
            {/* Controls */}
            <div className="w-full lg:w-80 space-y-4">
              <Tabs defaultValue="filters" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="filters" className="text-xs">
                    <Palette className="w-3.5 h-3.5 mr-1" />
                    Filters
                  </TabsTrigger>
                  <TabsTrigger value="text" className="text-xs">
                    <Type className="w-3.5 h-3.5 mr-1" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="crop" className="text-xs">
                    <Crop className="w-3.5 h-3.5 mr-1" />
                    Crop
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="filters" className="space-y-4 mt-4">
                  {/* Presets */}
                  <div className="grid grid-cols-3 gap-2">
                    {filterPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset(preset)}
                        className="text-xs"
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs">Brightness</Label>
                        <span className="text-xs text-muted-foreground">{brightness}%</span>
                      </div>
                      <Slider
                        value={[brightness]}
                        onValueChange={([v]) => updateState({ brightness: v })}
                        min={0}
                        max={200}
                        step={1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs">Contrast</Label>
                        <span className="text-xs text-muted-foreground">{contrast}%</span>
                      </div>
                      <Slider
                        value={[contrast]}
                        onValueChange={([v]) => updateState({ contrast: v })}
                        min={0}
                        max={200}
                        step={1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs">Saturation</Label>
                        <span className="text-xs text-muted-foreground">{saturation}%</span>
                      </div>
                      <Slider
                        value={[saturation]}
                        onValueChange={([v]) => updateState({ saturation: v })}
                        min={0}
                        max={200}
                        step={1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs">Blur</Label>
                        <span className="text-xs text-muted-foreground">{blur}px</span>
                      </div>
                      <Slider
                        value={[blur]}
                        onValueChange={([v]) => updateState({ blur: v })}
                        min={0}
                        max={10}
                        step={0.5}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs">Grayscale</Label>
                        <span className="text-xs text-muted-foreground">{grayscale}%</span>
                      </div>
                      <Slider
                        value={[grayscale]}
                        onValueChange={([v]) => updateState({ grayscale: v })}
                        min={0}
                        max={100}
                        step={1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs">Sepia</Label>
                        <span className="text-xs text-muted-foreground">{sepia}%</span>
                      </div>
                      <Slider
                        value={[sepia]}
                        onValueChange={([v]) => updateState({ sepia: v })}
                        min={0}
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Filters
                  </Button>
                </TabsContent>
                
                <TabsContent value="text" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Add Text</Label>
                      <Input
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="Enter text..."
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Color</Label>
                        <Input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="h-8 p-1"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Size</Label>
                        <Input
                          type="number"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          min={12}
                          max={120}
                          className="h-8"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs">Font</Label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full h-8 px-2 text-sm rounded-md border border-input bg-background"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Impact">Impact</option>
                      </select>
                    </div>
                    
                    <Button onClick={handleAddText} disabled={!newText.trim()} className="w-full" size="sm">
                      <Type className="w-4 h-4 mr-2" />
                      Add Text
                    </Button>
                  </div>
                  
                  {textOverlays.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs">Text Layers</Label>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {textOverlays.map((overlay) => (
                          <div
                            key={overlay.id}
                            className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer ${
                              selectedTextId === overlay.id ? 'bg-primary/20 border border-primary' : 'bg-muted'
                            }`}
                            onClick={() => setSelectedTextId(overlay.id)}
                          >
                            <span className="truncate flex-1">{overlay.text}</span>
                            <div className="flex items-center gap-1 ml-2">
                              <RotateCw className="w-3 h-3 text-muted-foreground" />
                              <Maximize2 className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedTextId && (
                        <Button variant="destructive" size="sm" onClick={handleDeleteSelectedText} className="w-full">
                          Delete Selected
                        </Button>
                      )}
                      <div className="space-y-1 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        <p className="flex items-center gap-1"><Move className="w-3 h-3" /> Drag text to move</p>
                        <p className="flex items-center gap-1"><Maximize2 className="w-3 h-3" /> Drag corner handles to resize</p>
                        <p className="flex items-center gap-1"><RotateCw className="w-3 h-3" /> Drag green handle to rotate</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="crop" className="space-y-4 mt-4">
                  <p className="text-xs text-muted-foreground">
                    {isCropping 
                      ? "Click and drag on the image to select the crop area."
                      : "Enable crop mode to select an area of the image to keep."
                    }
                  </p>
                  
                  {!isCropping ? (
                    <Button onClick={() => setIsCropping(true)} className="w-full" size="sm">
                      <Crop className="w-4 h-4 mr-2" />
                      Start Cropping
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button 
                        onClick={applyCrop} 
                        disabled={!cropArea || cropArea.width < 10 || cropArea.height < 10}
                        className="w-full"
                        size="sm"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Apply Crop
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => { setIsCropping(false); setCropArea(null); }}
                        className="w-full"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </TooltipProvider>
  );
};

export default ImageEditor;
