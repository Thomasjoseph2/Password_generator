import { useEffect, useState } from 'react';
import { BsClipboardFill, BsTrashFill } from 'react-icons/bs';
import { LiaEyeSolid, LiaEyeSlash } from 'react-icons/lia';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDeletePasswordMutation, useSavePasswordMutation } from '../slices/usersApiSlice';
import axios from 'axios';

const Generator = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [result, setResult] = useState('');
  const [collection, setCollection] = useState([]);
  const [visible, setVisible] = useState('');
  const [action, setAction] = useState(false);

  const [values, setValues] = useState({
    length: 5,
    capital: true,
    small: true,
    number: true,
    special: true,
  });

  const fieldsArray = [
    {
      field: values.capital,
      getChar: () => getRandomChar(65, 90),
    },
    {
      field: values.small,
      getChar: () => getRandomChar(97, 122),
    },
    {
      field: values.number,
      getChar: () => getRandomChar(48, 57),
    },
    {
      field: values.special,
      getChar: () => getSpecialChar(),
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    let generatedPassword = '';
    const checkedFields = fieldsArray.filter(({ field }) => field);

    for (let i = 0; i < values.length; i++) {
      const index = Math.floor(Math.random() * checkedFields.length);
      const letter = checkedFields[index]?.getChar();
      if (letter) {
        generatedPassword += letter;
      }
    }

    if (generatedPassword) {
      setResult(generatedPassword);
    } else {
      toast.error(' Please select at least one option');
    }
  };

  const handleClipboard = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      toast.success('Copied to your clipboard');
    } else {
      toast.error('No password to copy');
    }
  };

  const [savePassword] = useSavePasswordMutation();

  const saveHandler = async () => {
    try {
      let res = await savePassword({ result }).unwrap();
      if (res) {
        toast.success('Password Saved Successfully');
        setResult('');
        setAction(!action);
      }
    } catch (error) {
      toast.error(error?.data.message);
    }
  };

  const [deletePassword] = useDeletePasswordMutation();

  const deleteHandler = async (id) => {
    try {
      let res = await deletePassword({ saved: id }).unwrap();
      if (res) {
        toast.success('Password Deleted Successfully');
        setAction(!action);
      }
    } catch (error) {
      toast.error(error?.data.message);
    }
  };

  useEffect(() => {
    if (!userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  useEffect(() => {
    try {
      const fetchCollection = async () => {
        let res = await axios.get(`/api/users/get-saved/${userInfo._id}`);
        console.log(res.data);
        setCollection(res.data);
      };
      if (userInfo) {
        fetchCollection();
      }
    } catch (error) {
      console.log(error.data);
    }
  }, [action,userInfo]);

 function getRandomChar(min,max){
    const limit = max-min+1;
    return String.fromCharCode(Math.floor(Math.random()*limit)+min);
}

 function getSpecialChar(){
    const specialChar = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~'";
    return specialChar[Math.floor(Math.random()*specialChar.length)];
}

  return (
    <div className='h-5/6 flex flex-col bg-bg-teal-600 justify-between'>
      <div className='h-full flex justify-between'>
        <div className='h-full w-1/2 flex justify-center items-center'>
          <div className='bg-teal-400 w-3/6 p-5 rounded-lg'>
            <div className='w-full h-8 flex'>
              <input
                type='text'
                value={result}
                className='h-full p-3 w-5/6 rounded-tl rounded-bl focus:outline-none'
                readOnly
              />
              <div
                onClick={handleClipboard}
                className='bg-teal-300 cursor-pointer flex justify-center items-center p-2 w-1/6 rounded-tr rounded-br'
              >
                <BsClipboardFill className='text-xl bg-teal-400' />
              </div>
            </div>
            {result ? (
              <button
                onClick={saveHandler}
                className='bg-green-500 hover:bg-teal-300 w-full mt-3 p-1 rounded-lg text-white font-medium'
              >
                Save Password
              </button>
            ) : null}
            <form onSubmit={handleSubmit}>
              <div className='flex justify-between my-6'>
                <h1 className='text-black font-medium'>Length (5-15)</h1>
                <input
                  type='number'
                  value={values.length}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      length: parseInt(e.target.value),
                    })
                  }
                  name='length'
                  min={5}
                  max={15}
                  className='w-1/6'
                />
              </div>
              <div className='flex justify-between my-6'>
                <h1 className='text-black font-medium'>Capital Letters</h1>
                <input
                  type='checkbox'
                  checked={values.capital}
                  onChange={(e) =>
                    setValues({ ...values, capital: e.target.checked })
                  }
                  name='capital'
                  className='w-5 h-5'
                />
              </div>
              <div className='flex justify-between my-6'>
                <h1 className='text-black font-medium'>Small Letters</h1>
                <input
                  type='checkbox'
                  checked={values.small}
                  onChange={(e) =>
                    setValues({ ...values, small: e.target.checked })
                  }
                  name='small'
                  className='w-5 h-5'
                />
              </div>
              <div className='flex justify-between my-6'>
                <h1 className='text-black font-medium'>Numbers</h1>
                <input
                  type='checkbox'
                  checked={values.number}
                  onChange={(e) =>
                    setValues({ ...values, number: e.target.checked })
                  }
                  name='number'
                  className='w-5 h-5'
                />
              </div>
              <div className='flex justify-between my-6'>
                <h1 className='text-black font-medium'>Special Characters</h1>
                <input
                  type='checkbox'
                  checked={values.special}
                  onChange={(e) =>
                    setValues({ ...values, special: e.target.checked })
                  }
                  name='special'
                  className='w-5 h-5'
                />
              </div>
              <div className='my-2 w-full'>
                <button
                  type='submit'
                  className='bg-green-500 hover:bg-bg-teal-300 w-full p-2 rounded-lg text-white font-medium'
                >
                  Generate Password
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className='h-5/6 w-1/2 bg-teal-400 mt-10 mx-5 rounded-lg'>
          <div className='px-3 flex items-center h-1/6'>
            <h1 className='text-black font-bold text-xl tracking-widest'>
              Saved Passwords
            </h1>
          </div>
          <div className='overflow-y-auto h-5/6'>
            {collection.length > 0 ? (
              collection.map((password) => (
                <div
                  key={password._id}
                  className='bg-teal-500 m-3 p-3 rounded flex justify-between'
                >
                  {visible === password._id ? (
                    <h1>{password.saved || ''}</h1>
                  ) : (
                    <h1>{'*'.repeat(password.saved?.length || 0)}</h1>
                  )}
                  <div className='flex'>
                    {visible === password._id ? (
                      <LiaEyeSolid
                        onMouseUp={() => setVisible('')}
                        onMouseLeave={() => setVisible('')}
                        className='text-2xl mx-1 cursor-pointer text-primaryColor'
                      />
                    ) : (
                      <LiaEyeSlash
                        onMouseDown={() => setVisible(password._id)}
                        className='text-2xl mx-1 cursor-pointer text-primaryColor'
                      />
                    )}
                    <BsTrashFill
                      onClick={() => deleteHandler(password._id)}
                      className='text-2xl mx-1 cursor-pointer text-primaryColor'
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className='w-full h-full flex justify-center items-center'>
                <h1 className='text-white font-bold'>
                  No Saved Passwords
                </h1>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
