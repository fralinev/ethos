import React, {useRef} from "react"
import './input.css'
const Input = () => {

const taRef = useRef(null)
const growerRef = useRef(null)
    // const growers = document.querySelectorAll(".grow-wrap");

    // growers.forEach((grower) => {
    //   const textarea = grower.querySelector("textarea");
    //   textarea.addEventListener("input", () => {
    //     grower.dataset.replicatedValue = textarea.value;
    //   });
    // });

    const handleInput = (event) => {
        growerRef.current.dataset.replicatedValue=taRef.current.value
    }

    return (

        <>

            <h1>Auto-Growing <code>&lt;textarea&gt;</code></h1>

            <form action="#0">

                <label for="text">Text:</label>
                <div class="grow-wrap"  ref={growerRef}>
                    <textarea ref={taRef} name="text" id="text" onInput={handleInput}></textarea>
                </div>

            </form>
        </>
    )
}

export default Input