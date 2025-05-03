import Spinner from "../_components/Spinner"

function loading() {
    return (
        <div className="grid justify-center items-center">
            <Spinner />
            <p className="text-lg font-bold">Data Is Loading...</p>
        </div>
    )
}

export default loading
