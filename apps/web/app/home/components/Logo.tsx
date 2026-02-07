export default function Logo({fontSize, svgSize, color}:{fontSize:number, svgSize: number, color: string}) {
  return (
    <div style={{display: "flex", alignItems: "center"}}>
        <span style={{fontSize}}>E</span>
        <span style={{fontSize}}>T</span>
        <span style={{fontSize}}>H</span>
        <svg style={{ fontSize: svgSize }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1em" height="1em" role="img" aria-label="Maze icon">
          <g
            fill="none"
            stroke={color}
            strokeWidth={7}
            strokeLinecap="butt"
          >
            <circle cx="50" cy="50" r="36" strokeDasharray="50 4" strokeDashoffset="5" />
            <circle cx="50" cy="50" r="24" strokeDasharray="30 4" strokeDashoffset="11" />
            <circle cx="50" cy="50" r="12" strokeDasharray="15 4" strokeDashoffset="19" />
          </g>
        </svg>
        <span style={{fontSize}}>S</span>
      </div>
  )
}