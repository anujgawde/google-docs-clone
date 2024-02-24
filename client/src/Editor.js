import React, { useCallback, useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";
import Quill from "quill";

import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
const AUTO_SAVE = 2000;
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];
export default function Editor() {
  const [quill, setQuill] = useState();
  const [socket, setSocket] = useState();
  const { id: documentId } = useParams();

  //   Socket Connection:
  useEffect(() => {
    const s = io("http://localhost:9001/");
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  //   Quill Creation:
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper === null) return;
    wrapper.innerHTML = "";

    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: {
        toolbar: TOOLBAR_OPTIONS,
      },
    });
    setQuill(q);
    q.disable();
    q.setText("Loading the document...");
  }, []);

  //   Emitting Changes:
  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    quill.on("text-change", handler);
    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  //   Implementing changes to the document:
  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handler);
    return (
      () => {
        socket.off("receive-changes", handler);
      },
      [socket, quill]
    );
  });

  //   Specific Document
  useEffect(() => {
    if (socket == null || quill == null) return;
    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });
    socket.emit("get-document", documentId);
  }, [socket, quill, documentId]);

  // Save Document in intervals:
  useEffect(() => {
    if (socket == null || quill == null) return;
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, AUTO_SAVE);
    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  return <div id="container" className="container" ref={wrapperRef}></div>;
}
