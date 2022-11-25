import axios, { AxiosResponse } from "axios"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"
import { IAppContextTypes, ICategory, ICollectionResponse } from "../types"
import { AppContext } from "./_app"
import Loading from "../components/Loading"
import { checkText, isJWTIsValid } from "../utils"
import Toast from "../components/Toast"

interface IPropTypes {
    categories: {
        items: ICategory[]
    }
}

export default function Write({ categories }: IPropTypes) {
    const router = useRouter()
    const { user, isLoggedIn, isLoading } = useContext(AppContext) as IAppContextTypes
    const [category, setCategory] = useState<string>('0')
    const [image, setImage] = useState<string>('')
    const [imagePreview, setImagePrivew] = useState<string | ArrayBuffer | null>(null)
    const [blog, setBlog] = useState({
        Title: '',
        Body: '',
        shortDescription: '',
        imageurl: '',
        Slug: ''
    })

    const checkUserData = () => {
        const title = checkText(blog.Title, 10, 150)
        const body = checkText(blog.Body, 300, 20000)
        const shortDescription = checkText(blog.shortDescription, 150, 250)

        if (imagePreview === null) Toast('For Blog Image choosen file should be jpg file.')
        if (!title) Toast('Title should be minimum 10 and maximum 150 characters.')
        if (!shortDescription) Toast('Short Description should be minimum 150 characters.')
        if (!body) Toast('Body should be minimum 300 characters.')
        if (category === '0') Toast('Category should be selected.')

        return title && body && shortDescription && category !== '0' && imagePreview !== null
    }

    const handleTextData = async () => {

        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_BASE_API_KEY}`
            }
        }

        const postresponse = await axios.post(`http://localhost:1337/api/articles`, { data: blog }, config)

        const response = await axios.put(`http://localhost:1337/api/articles/${postresponse.data.data.id}/?populate=categories&users`,
            {
                data: {
                    Category: [category],
                    author: [user.id]
                }
            },
            config
        )

        return postresponse
    }

    const handleImageData = async () => {
        const data = new FormData()
        data.append('files', image)

        const config = {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_BASE_API_KEY}`
            }
        }

        const response = await axios.post(`http://localhost:1337/api/upload`, data, config)
        return response
    }

    const handleImageAfterText = async (id: number, url: string) => {
        const config = {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_BASE_API_KEY}`
            }
        }

        const response = await axios.put(`http://localhost:1337/api/articles/${id}/?populate=imageurl`,
            {
                data: {
                    imageurl: url
                }
            },
            config
        )
        return response
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()

        if (!checkUserData()) {
            return
        }

        try {
            if (isJWTIsValid()) {
                const textResponse = await handleTextData()
                const fileResponse = await handleImageData()
                const response = await handleImageAfterText(textResponse.data.data.id, fileResponse.data[0].url)
                router.push('/')
            } else {
                router.push('/signup')
            }
        } catch (e) {
            if (e.response.data.error.details.errors[0].path[0] == 'Title') {
                Toast('This is a blog above the title so you have something else')
            }
        }
    }

    const handleChange = (e: any) => {
        if (e.target.name === "Image" && e.target.files[0]) {
            const reader = new FileReader()

            reader.onload = () => {
                if (reader.readyState === 2) setImagePrivew(reader.result)
            }

            reader.readAsDataURL(e.target.files[0])

            setImagePrivew(e.target.files[0])

            const file = e.target.files[0]
            const blob = file.slice(0, file.size, 'image/png')
            const nameChnagedFile = new File([blob], `${Date.now()}`, { type: 'image/png' })

            setImage(nameChnagedFile)
        } else {
            setBlog({ ...blog, [e.target.name]: e.target.value })
        }
    }

    useEffect(() => {
        const dummy = blog.Title
        const slug = dummy.split(' ').map(str => str.toLowerCase()).join('-')
        setBlog({ ...blog, ['Slug']: slug })
    }, [blog.Title])

    useEffect(() => {
        const jwt = localStorage.getItem('jwt')
        if (!jwt) {
            router.push('/')
        }
    }, [])

    return (
        <div className="screen-height flex items-center justify-center">
            {isLoading && (
                <Loading />
            )}
            {isLoggedIn && !isLoading && (
                <div className="w-[400px] my-20 rounded-lg bg-[#53bd9530]">
                    <form className="flex flex-col p-8" onSubmit={(e) => handleSubmit(e)} >
                        <h1 className="font-caveatbrush text-2xl text-center text-gray-600 mb-6">Write Blog</h1>
                        <input className="bg-transparent mb-5 px-2 h-10 focus:outline-none text-gray-600 border border-[#53bd95]" type="text" name="Title" placeholder="Title" onChange={(e) => handleChange(e)} />
                        <div className="signin flex gap-2">
                            {imagePreview &&
                                <img className="h-10 w-20 object-cover border border-[#53bd95]" src={imagePreview} alt="" />
                            }
                            <input className="mb-5 h-10 focus:outline-none text-gray-600 border border-[#53bd95]" type="file" name="Image" onChange={(e) => handleChange(e)} />
                        </div>
                        <input className="bg-transparent mb-5 px-2 h-10 focus:outline-none text-gray-600 border border-[#53bd95]" type="text" name="shortDescription" placeholder="Short Discription" onChange={(e) => handleChange(e)} />
                        <textarea className="write-textarea bg-transparent mb-5 px-2 h-28 focus:outline-none text-gray-600 border border-[#53bd95] resize-none" name="Body" placeholder="Body" onChange={(e) => handleChange(e)} />
                        <select className="bg-transparent mb-5 px-2 h-10 focus:outline-none text-gray-600 border border-[#53bd95]" onChange={(e) => setCategory(e.target.value)}>
                            <option className="bg-[#53bd9530]" value="0">Category</option>
                            {categories.items.map((category) => {
                                return (
                                    <option className="bg-[#53bd9530]" key={category.id} value={category.id}>
                                        {category.attributes.Title}
                                    </option>
                                )
                            })}
                        </select>
                        <div className="text-gray-600 pb-5 font-medium text-xs">
                            <p>All fiels are required. Title should be minimum 10 and maximum 150 characters. Body should be minimum 300 characters. Short Description should be minimum 150 characters. Category should be selected. For Blog Image should be jpg file.</p>
                        </div>
                        <div className="mt-5 flex items-center justify-center bottom-0 left-0 w-full p-2">
                            <button className="text-gray-700 pt-[2px] h-[42px] w-24 text-sm font-medium rounded-full bg-[#53bd9560]" type="submit">POST</button>
                        </div>
                    </form>
                </div>
            )
            }
        </div>
    )
}

export async function getServerSideProps() {
    const { data: categories }: AxiosResponse<ICollectionResponse<ICategory[]>> = await axios.get(`${process.env.API_BASE_URL}/api/categories`)

    return {
        props: {
            categories: {
                items: categories.data
            }
        }
    }
}