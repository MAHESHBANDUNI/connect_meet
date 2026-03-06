"use client";

import { useEffect, useRef, useState } from "react";
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
}

export const Whiteboard = ({ onDraw, externalData, className }: WhiteboardProps) => {
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const [lines, setLines] = useState<LineData[]>([]);
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);

  // Handle external drawing data
  useEffect(() => {
    if (externalData && externalData.data) {
      const { type, payload } = externalData.data;
      if (type === "draw-line") {
        setLines((prev) => [...prev, payload]);
      } else if (type === "clear") {
        setLines([]);
      }
    }
  }, [externalData]);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    const newLine: LineData = { 
      tool, 
      points: [pos.x, pos.y],
      color: "#007bff",
      strokeWidth: tool === "eraser" ? 20 : 3
    };
    setLines([...lines, newLine]);
  };

  const handleMouseMove = (e: any) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    setLines((prevLines) => {
        let lastLine = prevLines[prevLines.length - 1];
        // add point
        lastLine.points = lastLine.points.concat([point.x, point.y]);

        // replace last
        prevLines.splice(prevLines.length - 1, 1, lastLine);
        return prevLines.concat();
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    
    // Send the last line to others
    if (onDraw && lines.length > 0) {
      onDraw({
        type: "draw-line",
        payload: lines[lines.length - 1],
      });
    }
  };

  const handleClear = () => {
    setLines([]);
    if (onDraw) {
      onDraw({ type: "clear" });
    }
  };

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
    <div className={`flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-xl ${className}`}>
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
          width={window.innerWidth} 
          height={window.innerHeight}
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
