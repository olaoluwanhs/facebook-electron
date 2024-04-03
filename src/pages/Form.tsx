/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeEvent,
  ChangeEventHandler,
  MouseEvent,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FormField, Form, Icon } from 'semantic-ui-react';
import { toast } from 'react-toastify';

declare let ipcRenderer: any;

const LabelStyle = {
  color: 'white',
  fontSize: 15,
};

const FormInput = () => {
  //
  const [confirming, setConfirming] = useState<boolean>(false);
  const [posting, setPosting] = useState<boolean>(false);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [screenShot, setScreenShot] = useState<string | null>(null);
  const uploadThumbnails = useRef<HTMLDivElement>(null);
  //
  const confirmAccounts: MouseEventHandler<HTMLButtonElement> = async (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    const form = document.querySelector('.post-form');
    if (!form) return;
    const mainForm = new FormData(form as HTMLFormElement);
    const data: any = { profiles: [] };
    for (const [k, v] of mainForm.entries()) {
      if (k.includes('profiles-to-post')) {
        data.profiles.push(v);
      }
      data[k] = v;
    }

    // console.log(data);
    ipcRenderer.send('launch-event', ['confirm-account', data]);
    setConfirming(true);
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    //
    e.preventDefault();
    const target = e.target as HTMLInputElement;
    const files: FileList = target.files as FileList;
    if (!uploadThumbnails.current) return;
    uploadThumbnails.current.innerHTML = '';
    Array.from(files).forEach((el) => {
      const element = el.type.includes('image')
        ? document.createElement('img')
        : el.type.includes('video')
        ? document.createElement('video')
        : null;
      if (!element) return;
      element.src = URL.createObjectURL(el);
      uploadThumbnails.current?.appendChild(element);
    });
    //
  };

  const addToQueue: MouseEventHandler<HTMLButtonElement> = (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    const form = document.querySelector('.post-form');
    if (!form) return;
    const mainForm = new FormData(form as HTMLFormElement);
    const data: any = { profiles: [], uploads: [] };
    for (const [k, v] of mainForm.entries()) {
      if (k.includes('profiles-to-post')) {
        data.profiles.push(v);
      } else if (k === 'uploads') {
        data.uploads.push((v as File).path);
      } else {
        data[k] = v;
      }
    }

    console.log(data);

    ipcRenderer.send('launch-event', [
      'create-post',
      {
        ...data,
        postData: {
          text: data['write-up'],
          upload: data['uploads'],
        },
      },
    ]);
    setPosting(true);
  };

  const setListeners = () => {
    ipcRenderer.on('send-profiles', (_event: any, args: string) => {
      setProfiles(JSON.parse(args));
      toast.success('Accounts confirmed, profiles retreived...');
    });
    ipcRenderer.on('send-post-completed', () => {
      setPosting(false);
    });
    ipcRenderer.on('send-post-error', (_e: any, args: string) => {
      setPosting(false);
      toast.error('Error: ' + JSON.parse(args)?.message);
    });
    ipcRenderer.on('send-screenshot', (_event: any, args: string) => {
      setScreenShot(args);
      setConfirming(false);
    });
  };

  useEffect(setListeners);
  //
  return (
    <>
      <>
        <h4 className='text-light'>Insert accounts details:</h4>
      </>
      <Form className={`post-form`}>
        <div className='form-row'>
          <FormField className='form-input-margin'>
            <label style={LabelStyle}>Facebook Username</label>
            <input placeholder='username' name='username' />
          </FormField>
          <FormField className='form-input-margin'>
            <label style={LabelStyle}>Facebook Password</label>
            <input placeholder='password' name='password' />
          </FormField>
          <FormField className='form-input-margin'>
            <label style={LabelStyle}>______</label>
            <button
              // style={{ background: '#431C61' }}
              style={{
                background: '#431C61',
                display: 'flex',
                flexDirection: 'row',
                textWrap: 'nowrap',
              }}
              onClick={confirmAccounts}
              disabled={confirming || posting}
            >
              {confirming ? (
                <Icon name='spinner' />
              ) : (
                <Icon name='facebook f' />
              )}
              Confirm Account
            </button>
          </FormField>
        </div>

        {profiles.length > 0 && (
          <>
            <>
              <h4 className='text-light'>Screenshot:</h4>
            </>
            {screenShot && (
              <img
                style={{
                  width: '30rem',
                  height: '25rem',
                }}
                src={`data:image/png;base64,${screenShot}`}
              />
            )}
            <>
              <h4 className='text-light'>Select profiles to post to:</h4>
              {}
            </>

            {profiles.map((e, i) => (
              <div className='form-check d-flex' key={i}>
                <input
                  className='form-check-input profiles-to-post'
                  type='checkbox'
                  value={e}
                  name={`profiles-to-post:${e}`}
                  id='flexCheckDefault'
                />
                <label className='form-check-label text-white mx-2'>{e}</label>
              </div>
            ))}

            <>
              <h4 className='text-light'>Insert post information:</h4>
            </>

            <>
              <div
                className='container d-flex img-thumbnails'
                ref={uploadThumbnails}
              >
                {}
              </div>
              <input
                type='file'
                name='uploads'
                className='my-3'
                multiple
                onChange={handleFileChange}
              />
            </>

            <>
              <h4 className='text-light'>Insert post information:</h4>
            </>

            <>
              <textarea
                name='write-up'
                cols={30}
                rows={10}
                placeholder="What's on your mind?"
              ></textarea>
            </>

            <button
              className='mt-5'
              onClick={addToQueue}
              disabled={confirming || posting}
            >
              {posting ? <Icon name='spinner' /> : <Icon name='facebook f' />}
              Submit
            </button>
          </>
        )}
      </Form>
    </>
  );
};

export default FormInput;
