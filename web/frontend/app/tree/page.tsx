"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge,
  useNodesState,
  useEdgesState,
  Panel
} from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "@/store/useStore";
import { ArrowRight, ArrowLeft, Download, Share2 } from "lucide-react";
import { toPng } from "html-to-image";

// Helper to convert our custom AST tree to React Flow nodes/edges
const generateFlowElements = (tree: any) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // First pass: calculate required width for each subtree to prevent overlapping
  const calculateWidths = (node: any) => {
    if (!node) return 0;
    if (!node.children || node.children.length === 0) {
      node.width = 160; // base width of a node
      return node.width;
    }
    let totalWidth = 0;
    node.children.forEach((c: any) => {
      totalWidth += calculateWidths(c);
    });
    // Total width plus 40px gaps between siblings
    node.width = Math.max(160, totalWidth + (node.children.length - 1) * 40);
    return node.width;
  };

  calculateWidths(tree);
  
  const traverse = (node: any, x: number, y: number, parentId: string | null = null) => {
    if (!node) return;
    
    const id = `node-${nodes.length}`;
    
    // Determine color based on node type
    let bgColor = "#18181b"; // default card
    let borderColor = "#3f3f46";
    let textColor = "#fafafa";
    
    if (node.type === 'Program' || node.type === 'Statements') {
      bgColor = "rgba(168, 85, 247, 0.1)";
      borderColor = "rgba(168, 85, 247, 0.5)";
      textColor = "#e9d5ff"; // purple
    } else if (node.type === 'Terminal' || node.type === 'Identifier' || node.type === 'Number' || node.type === 'Operator') {
      bgColor = "rgba(59, 130, 246, 0.1)";
      borderColor = "rgba(59, 130, 246, 0.5)";
      textColor = "#bfdbfe"; // blue
    } else {
      bgColor = "rgba(234, 88, 12, 0.1)";
      borderColor = "rgba(234, 88, 12, 0.5)";
      textColor = "#fed7aa"; // orange
    }

    nodes.push({
      id,
      position: { x, y },
      data: { label: node.value || node.type },
      style: {
        background: bgColor,
        border: `1px solid ${borderColor}`,
        color: textColor,
        borderRadius: "8px",
        padding: "10px",
        minWidth: "120px",
        textAlign: "center",
        fontWeight: "bold",
        fontFamily: "monospace",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
      }
    });

    if (parentId !== null) {
      edges.push({
        id: `edge-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: "#60a5fa", strokeWidth: 2 }
      });
    }

    if (node.children && node.children.length > 0) {
      // Start positioning children from the left edge of this node's allotted width
      let startX = x - (node.width / 2);
      
      node.children.forEach((child: any) => {
        let childWidth = child.width || 160;
        let childCenterX = startX + (childWidth / 2);
        traverse(child, childCenterX, y + 100, id);
        startX += childWidth + 40; // 40px gap between sibling subtrees
      });
    }
  };

  traverse(tree, 0, 0);
  
  // Center the root
  if (nodes.length > 0) {
     const minX = Math.min(...nodes.map(n => n.position.x));
     const maxX = Math.max(...nodes.map(n => n.position.x));
     const offset = (maxX + minX) / 2;
     nodes.forEach(n => { n.position.x -= offset; });
  }

  return { initialNodes: nodes, initialEdges: edges };
};

export default function ParseTreePage() {
  const router = useRouter();
  const { parseTree, setCCode } = useStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const flowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parseTree) {
      const { initialNodes, initialEdges } = generateFlowElements(parseTree);
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [parseTree, setNodes, setEdges]);

  const handleNext = async () => {
    setIsGenerating(true);
    try {
      // Re-parse with generateC = true (or we could just use the AST we already have, but the backend does it together easily)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: useStore.getState().code, generateC: true })
      });
      const data = await res.json();
      setCCode(data.cCode || "");
      router.push("/codegen");
    } catch (err) {
      console.error(err);
      alert("Failed to generate C code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    const el = document.querySelector('.react-flow') as HTMLElement;
    if (!el) return;
    
    try {
      const dataUrl = await toPng(el, {
        backgroundColor: '#09090b',
        filter: (node) => {
          if (
            node?.classList?.contains('react-flow__minimap') ||
            node?.classList?.contains('react-flow__controls') ||
            node?.classList?.contains('react-flow__panel')
          ) {
            return false;
          }
          return true;
        },
      });
      
      const link = document.createElement('a');
      link.download = 'parse-tree.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download image", err);
      alert("Failed to download image. Try zooming out slightly.");
    }
  };

  if (!parseTree) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Share2 className="w-16 h-16 text-zinc-600 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Parse Tree Found</h2>
        <p className="text-zinc-400 mb-6">Go back to Syntax Analysis to generate the tree.</p>
        <button 
          onClick={() => router.push("/parser")}
          className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Parser</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 md:p-8 h-screen pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 md:gap-0"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Parse Tree Visualization</h1>
          <p className="text-zinc-400">Interactive graphical representation of the AST.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          <button
            onClick={() => router.push("/parser")}
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition-colors border border-zinc-700 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <button
            onClick={handleNext}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isGenerating ? <span>Generating...</span> : <span>Generate C Code</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full h-[600px] glass rounded-2xl border border-zinc-800 overflow-hidden relative"
        ref={flowRef}
        style={{ minHeight: '600px' }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          className="bg-zinc-950/50"
        >
          <Background color="#3f3f46" gap={16} />
          <Controls className="bg-zinc-800 border-zinc-700 fill-zinc-300" />
          <MiniMap 
            nodeColor={(n) => {
              if (n.style?.background) return n.style.background as string;
              return '#18181b';
            }}
            maskColor="rgba(9, 9, 11, 0.7)"
            className="bg-zinc-900 border border-zinc-800"
          />
          <Panel position="top-right" className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800 backdrop-blur-sm">
            <button 
                onClick={handleDownloadImage}
                className="flex items-center space-x-2 text-sm text-zinc-300 hover:text-white transition-colors px-3 py-1.5"
            >
                <Download className="w-4 h-4" />
                <span>Download .png</span>
            </button>
          </Panel>
        </ReactFlow>
      </motion.div>
    </div>
  );
}
