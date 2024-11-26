import { useNavigate } from 'react-router-dom'
import avatar from '../assets/profile.png';
import { Toaster } from 'react-hot-toast';
import { useFormik } from 'formik';
import { usernameValidate } from '../helper/validate'
import { useAuthStore } from '../store/store'

export default function Username() {

    const navigate = useNavigate();
    const setUsername = useAuthStore(state => state.setUsername);

    const formik = useFormik({
        initialValues: {
            username: 'example123'
        },
        validate: usernameValidate,
        validateOnBlur: false,
        validateOnChange: false,
        onSubmit: async values => {
            setUsername(values.username);
            navigate('/password')
        }
    })

    return (
        <div className="container mx-auto">

            <Toaster position='top-center' reverseOrder={false}></Toaster>

            <div className='flex justify-center items-center h-screen'>
                <div className="backdrop-blur rounded-2xl shadow-md border-solid border-2 border-gray-50">

                    <div className="title flex flex-col items-center">
                        <h4 className='text-5xl font-bold'>Hello Again!</h4>
                        <span className='py-4 text-xl w-2/3 text-center text-gray-500'>
                            Explore More by connecting with us.
                        </span>
                    </div>

                    <form className='py-1' onSubmit={formik.handleSubmit}>
                        <div className='profile flex justify-center py-4'>
                            <img src={avatar} className="border-4 border-gray-100 w-[135px] rounded-full shadow-lg cursor-pointer hover:border-gray-200" alt="avatar" />
                        </div>

                        <div className="textbox flex flex-col items-center gap-6">
                            <input {...formik.getFieldProps('username')} className="border-0 px-5 py-4 rounded-xl w-3/4 shadow-sm text-lg" type="text" placeholder='Username' />
                            <button className="border bg-indigo-500 w-3/4 py-4 rounded-lg text-gray-50 text-xl shadow-sm text-center" type='submit'>Lets Go</button>
                        </div>

                        <div className="text-center py-4">
                            <span className='text-gray-500'>Not a Member <a className='text-red-500' to="/register">Register Now</a></span>
                        </div>

                    </form>

                </div>
            </div>
        </div>
    )
}