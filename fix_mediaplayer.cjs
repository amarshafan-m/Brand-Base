const fs = require('fs');
const file = 'src/js/main/components/MediaPlayer.tsx';
let code = fs.readFileSync(file, 'utf8');

// Insert refs for event handlers
if (!code.includes('mouseMoveHandler.current')) {
  code = code.replace(
    'const isDragging = useRef(false);',
    `const isDragging = useRef(false);
  const mouseMoveHandler = useRef<((e: MouseEvent) => void) | null>(null);
  const mouseUpHandler = useRef<(() => void) | null>(null);`
  );

  code = code.replace(
    '  useEffect(() => {\n    if (!mediaRef.current) return;',
    `  useEffect(() => {
    return () => {
      if (mouseMoveHandler.current) window.removeEventListener('mousemove', mouseMoveHandler.current);
      if (mouseUpHandler.current) window.removeEventListener('mouseup', mouseUpHandler.current);
    };
  }, []);

  useEffect(() => {
    if (!mediaRef.current) return;`
  );
  
  const oldPointerDown = `    const onMouseMove = (moveEvent: MouseEvent) => {
      if (isDragging.current) {
        handleSeek(moveEvent.clientX, target);
      }
    };
    
    const onMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);`;
    
  const newPointerDown = `    const onMouseMove = (moveEvent: MouseEvent) => {
      if (isDragging.current) {
        handleSeek(moveEvent.clientX, target);
      }
    };
    
    const onMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      mouseMoveHandler.current = null;
      mouseUpHandler.current = null;
    };
    
    mouseMoveHandler.current = onMouseMove;
    mouseUpHandler.current = onMouseUp;
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);`;
    
  code = code.replace(oldPointerDown, newPointerDown);
  fs.writeFileSync(file, code);
  console.log("Success");
}
