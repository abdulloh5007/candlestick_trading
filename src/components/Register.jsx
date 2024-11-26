import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import avatar from '../assets/profile.png';
import toast, { Toaster } from 'react-hot-toast';
import { useFormik } from 'formik';
import { registerValidation } from '../helper/validate';
import convertToBase64 from '../helper/convert';
import { registerUser } from '../helper/helper'

export default function Register() {

    const navigate = useNavigate()
    const [file, setFile] = useState()

    const formik = useFormik({
        initialValues: {
            email: 'doyol56239@cnogs.com',
            username: 'example123',
            password: 'admin@123'
        },
        validate: registerValidation,
        validateOnBlur: false,
        validateOnChange: false,
        onSubmit: async values => {
            values = await Object.assign(values, { profile: file || '' })
            let registerPromise = registerUser(values)
            toast.promise(registerPromise, {
                loading: 'Creating...',
                success: <b>Register Successfully...!</b>,
                error: <b>Could not Register.</b>
            });

            registerPromise.then(function () { navigate('/') });
        }
    })

    /** formik doensn't support file upload so we need to create this handler */
    const onUpload = async e => {
        const base64 = await convertToBase64(e.target.files[0]);
        setFile(base64);
    }

    return (
        <div className="container mx-auto">

            <Toaster position='top-center' reverseOrder={false}></Toaster>

            <div className='flex justify-center items-center h-screen'>
                <div className="backdrop-blur rounded-2xl shadow-md border-solid border-2 border-gray-50" style={{ width: "45%", paddingTop: '3em' }}>

                    <div className="title flex flex-col items-center">
                        <h4 className='text-5xl font-bold'>Register</h4>
                        <span className='py-4 text-xl w-2/3 text-center text-gray-500'>
                            Happy to join you!
                        </span>
                    </div>

                    <form className='py-1' onSubmit={formik.handleSubmit}>
                        <div className='profile flex justify-center py-4'>
                            <label htmlFor="profile">
                                <img src={file || avatar} className="border-4 border-gray-100 w-[135px] rounded-full shadow-lg cursor-pointer hover:border-gray-200" alt="avatar" />
                            </label>

                            <input onChange={onUpload} type="file" id='profile' name='profile' />
                        </div>

                        <div className="textbox flex flex-col items-center gap-6">
                            <input {...formik.getFieldProps('email')} className="border-0 px-5 py-4 rounded-xl w-3/4 shadow-sm text-lg" type="text" placeholder='Email*' />
                            <input {...formik.getFieldProps('username')} className="border-0 px-5 py-4 rounded-xl w-3/4 shadow-sm text-lg" type="text" placeholder='Username*' />
                            <input {...formik.getFieldProps('password')} className="border-0 px-5 py-4 rounded-xl w-3/4 shadow-sm text-lg" type="text" placeholder='Password*' />
                            <button className="border bg-indigo-500 w-3/4 py-4 rounded-lg text-gray-50 text-xl shadow-sm text-center" type='submit'>Register</button>
                        </div>

                        <div className="text-center py-4">
                            <span className='text-gray-500'>Already Register? <a className='text-red-500' to="/">Login Now</a></span>
                        </div>

                    </form>

                </div>
            </div>
        </div>
    )
}
