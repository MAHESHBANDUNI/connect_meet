"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Stage, Layer, Line } from "react-konva";
import { Eraser, Pencil, Trash2, Download } from "lucide-react";

interface WhiteboardProps {
  onDraw?: (data: any) => void;
  externalData?: { data: any; userId: string; timestamp: number } | null;
  className?: string;
}

interface LineData {
  tool: "pencil" | "eraser";
  points: number[];
  color?: string;
  strokeWidth?: number;
  id?: string; // Unique identifier for the line
}

export const Whiteboard = ({ onDraw, externalData, className }: WhiteboardProps) => {
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const [lines, setLines] = useState<LineData[]>([]);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLineIndexRef = useRef<number>(-1);
  const sentLineIdsRef = useRef<Set<string>>(new Set());

  // Update stage size when container resizes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Generate a unique ID for a line based on its content
  const generateLineId = useCallback((line: LineData): string => {
    const pointsStr = line.points.slice(0, 10).join(','); // Use first 10 points for ID
    return `${line.tool}-${line.color}-${line.strokeWidth}-${pointsStr}`;
  }, []);

  // Handle external drawing data
  useEffect(() => {
    if (externalData && externalData.data) {
      const { type, payload } = externalData.data;
      console.log("Received whiteboard data:", { type, payload, userId: externalData.userId });
      if (type === "draw-line" && payload && payload.points && payload.points.length > 0) {
        const lineId = `${payload.tool}-${payload.color}-${payload.strokeWidth}-${payload.points.slice(0, 10).join(',')}`;
        
        setLines((prev) => {
          // Check if this line already exists to avoid duplicates
          const lineExists = prev.some((line) => {
            const existingId = `${line.tool}-${line.color}-${line.strokeWidth}-${line.points.slice(0, 10).join(',')}`;
            return existingId === lineId;
          });
          
          if (!lineExists && !sentLineIdsRef.current.has(lineId)) {
            console.log("Adding new line to whiteboard");
            const newLine = { ...payload, id: lineId };
            return [...prev, newLine];
          } else if (lineExists) {
            console.log("Line already exists, skipping duplicate");
          }
          return prev;
        });
      } else if (type === "clear") {
        console.log("Clearing whiteboard");
        setLines([]);
        sentLineIdsRef.current.clear();
      }
    }
  }, [externalData]);

  const handleMouseDown = useCallback(
    (e: any) => {
      isDrawing.current = true;
      const pos = e.target.getStage().getPointerPosition();
      const newLine: LineData = {
        tool,
        points: [pos.x, pos.y],
        color: "#007bff",
        strokeWidth: tool === "eraser" ? 20 : 3,
      };
      setLines((prev) => {
        currentLineIndexRef.current = prev.length;
        return [...prev, newLine];
      });
    },
    [tool]
  );

  const handleMouseMove = useCallback((e: any) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    setLines((prevLines) => {
      if (currentLineIndexRef.current < 0 || currentLineIndexRef.current >= prevLines.length) {
        return prevLines;
      }
      const newLines = [...prevLines];
      const lastLine = newLines[currentLineIndexRef.current];
      if (lastLine) {
        lastLine.points = lastLine.points.concat([point.x, point.y]);
      }
      return newLines;
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    // Send the complete line to others
    setLines((prevLines) => {
      const currentLineIndex = currentLineIndexRef.current;
      if (
        onDraw &&
        prevLines.length > 0 &&
        currentLineIndex >= 0 &&
        currentLineIndex < prevLines.length
      ) {
        const lineToSend = prevLines[currentLineIndex];
        const lineId = `${lineToSend.tool}-${lineToSend.color}-${lineToSend.strokeWidth}-${lineToSend.points.slice(0, 10).join(',')}`;
        sentLineIdsRef.current.add(lineId);
        
        console.log("Sending whiteboard data:", {
          type: "draw-line",
          payload: lineToSend,
          lineId,
        });
        onDraw({
          type: "draw-line",
          payload: lineToSend,
        });
      }
      currentLineIndexRef.current = -1;
      return prevLines;
    });
  }, [onDraw]);

  const handleClear = useCallback(() => {
    setLines([]);
    sentLineIdsRef.current.clear();
    if (onDraw) {
      onDraw({ type: "clear" });
    }
  }, [onDraw]);

  const downloadImage = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div ref={containerRef} className={`flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-xl ${className}`}>
      {/* Tool Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool("pencil")}
            className={`p-2 rounded-lg transition-colors ${
              tool === "pencil" ? "bg-blue-600 text-white" : "hover:bg-slate-200 text-slate-600"
            }`}
            title="Pencil"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-2 rounded-lg transition-colors ${
              tool === "eraser" ? "bg-blue-600 text-white" : "hover:bg-slate-200 text-slate-600"
            }`}
            title="Eraser"
          >
            <Eraser className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button
            onClick={handleClear}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
            title="Clear Board"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={downloadImage}
          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-2 text-sm font-medium"
          title="Download as Image"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative bg-white cursor-crosshair overflow-hidden">
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          ref={stageRef}
          className="absolute inset-0"
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.tool === "eraser" ? "#ffffff" : "#007bff"}
                strokeWidth={line.strokeWidth || 5}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === "eraser" ? "destination-out" : "source-over"
                }
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};
