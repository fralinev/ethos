export default function SectionHeader({text}: {text:string}) {
    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            backgroundColor:"rgb(28, 31, 35)",
            padding: "12px 0"
            }}>
            {text}
        </div>
    )
}