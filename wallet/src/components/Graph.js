import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useDispatch, useSelector } from "react-redux";
import { setNodePositions } from "../store/graphSlice"; 

const Graph = ({ nodes, links }) => {
  const svgRef = useRef();
  const gRef = useRef();
  const minimapRef = useRef();
  const dispatch = useDispatch();
  const storedPositions = useSelector((state) => state.graph.nodePositions);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = 1200;
    const height = 800;

    const inflowLinks = links.filter(link => link.target === nodes[0]?.id || link.target?.id === nodes[0]?.id);
    const outflowLinks = links.filter(link => link.source === nodes[0]?.id || link.source?.id === nodes[0]?.id);
    const centerNode = nodes[0];

    const directedLinks = links.map(link => {
      const sourceId = typeof link.source === "string" ? link.source : link.source?.id;
      const targetId = typeof link.target === "string" ? link.target : link.target?.id;
      if (sourceId === centerNode?.id) {
        return { ...link, source: sourceId, target: targetId };
      } else if (targetId === centerNode?.id) {
        return { ...link, source: centerNode.id, target: sourceId };
      }
      return { ...link };
    });

    const g = svg.append("g");
    gRef.current = g;

    const zoom = d3.zoom().scaleExtent([0.1, 10]).on("zoom", (event) => {
      g.attr("transform", event.transform);
      updateMinimapView(event.transform);
    });
    svg.call(zoom);

    g.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 28)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#00f2ff");

    const link = g.append("g")
      .selectAll("line")
      .data(directedLinks)
      .enter()
      .append("line")
      .attr("stroke-width", 2.5)
      .attr("stroke", d => parseFloat(d.amount) > 1 ? "#00f2ff" : "#ff00a1")
      .attr("stroke-dasharray", d => parseFloat(d.amount) > 1 ? "5,3" : "4,3")
      .attr("marker-end", "url(#arrow)");

    nodes.forEach((node) => {
      const saved = storedPositions[node.id];
      if (saved) {
        node.fx = saved.fx;
        node.fy = saved.fy;
      }
    });

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(directedLinks).id(d => d.id).distance(200))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const node = g.append("g")
      .selectAll("foreignObject")
      .data(nodes)
      .enter()
      .append("foreignObject")
      .attr("width", 180)
      .attr("height", 60)
      .attr("x", -90)
      .attr("y", -30)
      .html(d => {
        const label = d.label || `${d.id.slice(0, 6)}...${d.id.slice(-6)}`;
        const dateTime = d.timestamp
          ? `<div style="font-size:10px; color:#eee; margin-top:2px;">${d.timestamp}</div>`
          : '';
        return `
          <div xmlns="http://www.w3.org/1999/xhtml" style="
            background: ${d.label === "Changenow" ? "#ff8800" : d.label === "Whitebit" ? "#b794f4" : d.label ? "#ffb6c1" : "#38b2ac"};
            border-radius: 25px;
            padding: 6px 10px;
            color: white;
            text-align: center;
            font-size: 13px;
            font-weight: 500;
            box-shadow: 0 0 8px rgba(255,255,255,0.5);
            cursor: move;">
            <div>${label}</div>
            ${dateTime}
          </div>`;
      })
      .call(drag(simulation));

    const edgeLabels = g.append("g")
      .selectAll("text")
      .data(directedLinks)
      .enter()
      .append("text")
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .style("opacity", 1)
      .text(d => {
        const amount = parseFloat(d.amount?.replace(" BTC", ""));
        const timestamp = d.timestamp || "";
        return `${amount} BTC | ${timestamp}`;
      });

    simulation.on("tick", () => {
      const spacingX = 350;
      const spacingY = 200;
      const centerX = width / 2;
      const centerY = height / 2;

      if (centerNode && centerNode.fx === undefined) {
        centerNode.fx = centerX;
        centerNode.fy = centerY;
      }

      inflowLinks.forEach((link, i) => {
        const yOffset = inflowLinks.length === 1 ? -350 : (i - (inflowLinks.length - 1) / 2) * spacingY;
        const sourceNode = typeof link.source === "string" ? nodes.find(n => n.id === link.source) : link.source;
        if (sourceNode && sourceNode.fx === undefined) {
          sourceNode.fx = centerX - spacingX;
          sourceNode.fy = centerY + yOffset;
        }
      });

      outflowLinks.forEach((link, i) => {
        const yOffset = outflowLinks.length === 1 ? 150 : (i - (outflowLinks.length - 1) / 2) * spacingY;
        const targetNode = typeof link.target === "string" ? nodes.find(n => n.id === link.target) : link.target;
        if (targetNode && targetNode.fx === undefined) {
          targetNode.fx = centerX + spacingX;
          targetNode.fy = centerY + yOffset;
        }
      });

      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("x", d => d.x - 90)
        .attr("y", d => d.y - 30);

      edgeLabels
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2 - 20);

      renderMinimap(); 
    });

    function drag(simulation) {
      return d3.drag()
        .on("start", event => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on("drag", event => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on("end", event => {
          if (!event.active) simulation.alphaTarget(0);
          dispatch(setNodePositions({
            [event.subject.id]: {
              fx: event.subject.fx,
              fy: event.subject.fy,
            }
          }));
        });
    }

    
    const minimap = d3.select(minimapRef.current);
    const minimapScale = 0.15;
    const minimapG = minimap.append("g");

    const renderMinimap = () => {
      minimapG.selectAll("*").remove();

      minimapG.selectAll("line")
        .data(directedLinks)
        .enter()
        .append("line")
        .attr("x1", d => d.source.x * minimapScale)
        .attr("y1", d => d.source.y * minimapScale)
        .attr("x2", d => d.target.x * minimapScale)
        .attr("y2", d => d.target.y * minimapScale)
        .attr("stroke", "#999")
        .attr("stroke-width", 1);

      minimapG.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("cx", d => d.x * minimapScale)
        .attr("cy", d => d.y * minimapScale)
        .attr("r", 4)
        .attr("fill", "#00f2ff");

      const viewTransform = d3.zoomTransform(svgRef.current);
      minimap.selectAll("rect.viewport").remove();

      minimap.append("rect")
        .attr("class", "viewport")
        .attr("x", -viewTransform.x * minimapScale / viewTransform.k)
        .attr("y", -viewTransform.y * minimapScale / viewTransform.k)
        .attr("width", width * minimapScale / viewTransform.k)
        .attr("height", height * minimapScale / viewTransform.k)
        .attr("stroke", "#fff")
        .attr("fill", "none")
        .attr("stroke-width", 1);
    };

    const updateMinimapView = (transform) => {
      renderMinimap();
    };

  }, [nodes, links, dispatch, storedPositions]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        ref={svgRef}
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000",
          backgroundImage: "url('/graph-bg.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          cursor: "grab"
        }}
      />
      <svg
        ref={minimapRef}
        width={200}
        height={150}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          border: "1px solid #555",
          background: "#111"
        }}
      />
    </div>
  );
};

export default Graph;

