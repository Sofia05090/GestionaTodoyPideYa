// formulario reutilizable
import "./InputCampo.css";

function InputCampo({
    //props que recibe el componente
    etiqueta,
    id,
    nombre = id,
    tipo = "text",
    valor,
    alCambiar,
    placeholder = "",
    requerido = false,
    minLength,
    maxLength,
    autoComplete,
}) {
    return (
        <div className="input-campo-grupo">

            {/*al hacer clic en el, se va al input */}
            <label htmlFor={id} className="input-campo-label">
                {etiqueta}
            </label>

            {/* el input controlado por React ya que el valor viene del estado del padre */}
            <input
                id={id}
                name={nombre}
                type={tipo}
                value={valor}
                onChange={alCambiar}
                placeholder={placeholder}
                required={requerido}
                minLength={minLength}
                maxLength={maxLength}
                autoComplete={autoComplete}
                className="input-campo-input"
            />

        </div>
    );
}

export default InputCampo