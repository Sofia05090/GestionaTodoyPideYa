// formulario reutilizable
import "./InputCampo.css";

function InputCampo({
    //props
    etiqueta,
    id,
    tipo = "text",
    valor,
    alCambiar,
    placeholder = "",
    requerido = false,
}) {
    return (
        <div className="input-campo-grupo">

            {/*al hacer clic en él, se va al input */}
            <label htmlFor={id} className="input-campo-label">
                {etiqueta}
            </label>

            {/* el input controlado por React ya el valor viene del estado del padre */}
            <input
                id={id}
                type={tipo}
                value={valor}
                onChange={alCambiar}
                placeholder={placeholder}
                required={requerido}
                className="input-campo-input"
            />

        </div>
    );
}

export default InputCampo;
