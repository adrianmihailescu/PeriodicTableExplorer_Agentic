import type { ElectronShellDiagramProps } from "./types/ElectronShellDiagram.types";

const shellLabels = ["K", "L", "M", "N", "O", "P", "Q"];
const center = 150;

export default function ElectronShellDiagram({ element }: ElectronShellDiagramProps) {
  const shellDescription = element.electronShells
    .map((count, index) => `${shellLabels[index] ?? `Shell ${index + 1}`} shell: ${count} electrons`)
    .join(", ");

  return (
    <section className="electron-shell-panel" aria-labelledby="electron-shell-heading">
      <h3 id="electron-shell-heading">Electron shells</h3>
      <div className="electron-shell-content">
        <svg
          className="electron-shell-svg"
          viewBox="0 0 300 300"
          role="img"
          aria-label={`${element.name} electron shells: ${shellDescription}`}
        >
          {element.electronShells.map((count, shellIndex) => {
            const radius = 28 + shellIndex * 16;
            const startAngle = -Math.PI / 2 + shellIndex * 0.18;

            return (
              <g key={shellIndex}>
                <circle className="electron-orbit" cx={center} cy={center} r={radius} />
                {Array.from({ length: count }, (_, electronIndex) => {
                  const angle = startAngle + (electronIndex * 2 * Math.PI) / count;
                  return (
                    <circle
                      className="shell-electron"
                      key={electronIndex}
                      cx={center + radius * Math.cos(angle)}
                      cy={center + radius * Math.sin(angle)}
                      r="4"
                    />
                  );
                })}
              </g>
            );
          })}
          <circle className="shell-nucleus" cx={center} cy={center} r="17" />
          <text className="shell-nucleus-label" x={center} y={center + 4}>
            {element.symbol}
          </text>
        </svg>
        <ul className="electron-shell-key" aria-hidden="true">
          {element.electronShells.map((count, index) => (
            <li key={index}>
              <span>{shellLabels[index] ?? index + 1}</span>
              <strong>{count} e-</strong>
            </li>
          ))}
        </ul>
      </div>
      <p className="electron-shell-help">
        K–Q name the shells from inner to outer (n = 1–7). Each count shows the electrons in that shell; e- means electrons.
      </p>
    </section>
  );
}
