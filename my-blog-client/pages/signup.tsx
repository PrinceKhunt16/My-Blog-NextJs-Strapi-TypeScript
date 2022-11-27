import axios from "axios"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import Toast from "../components/Toast"
import { fetchUser } from "../redux/slices/user"
import { RootState } from "../redux/store"
import { checkEmail, checkText, fetchUserFromJWTToken } from "../utils"

export default function Login() {
    const { isSignedIn } = useSelector((state: RootState) => state.user)
    const dispatch = useDispatch()
    const router = useRouter()

    const [user, setUser] = useState({
        email: '',
        password: ''
    })

    const checkUserData = () => {
        const email = checkEmail(user.email)
        const password = checkText(user.password, 8, 20)
        return email && password
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()

        if (!checkUserData()) {
            Toast('Invalid user credentials')
            return
        }

        const data = new FormData()
        data.set("identifier", user.email)
        data.set("password", user.password)

        const config = {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_BASE_API_KEY}`
            }
        }

        try {
            const response = await axios.post(`http://localhost:1337/api/auth/local`, data, config)

            const { jwt } = response.data
            localStorage.setItem('jwt', JSON.stringify(jwt))

            dispatch(fetchUser())

            router.push('/')
            router.reload()
        } catch (e) {
            Toast('Invalid user credentials')
        }
    }

    const handleChange = (e: any) => {
        setUser({ ...user, [e.target.name]: e.target.value })
    }

    useEffect(() => {
        const jwt = localStorage.getItem('jwt')
        if (jwt) {
            router.push('/')
        }
    }, [])

    return (
        <>
            {
                !isSignedIn &&
                <>
                    <div className="screen-height h-full flex items-center justify-center" >
                        <div className="w-[400px] my-20 rounded-lg bg-[#53bd9530]">
                            <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col p-8">
                                <h1 className="font-caveatbrush text-2xl text-center text-gray-600 mb-6">Sign up</h1>
                                <input className="bg-transparent mb-5 px-2 h-10 focus:outline-none text-gray-600 border border-[#53bd95]" type="email" name="email" placeholder="Email" onChange={(e) => handleChange(e)} />
                                <input className="bg-transparent mb-5 px-2 h-10 focus:outline-none text-gray-600 border border-[#53bd95]" type="password" name="password" placeholder="Password" onChange={(e) => handleChange(e)} />
                                <div className="mt-5 flex items-center justify-center bottom-0 left-0 w-full p-2">
                                    <button type="submit" className="text-gray-700 mt-4 h-[40px] w-20 text-xs font-bold rounded-full bg-[#53bd9560]">SIGN UP</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            }
        </>
    )
}