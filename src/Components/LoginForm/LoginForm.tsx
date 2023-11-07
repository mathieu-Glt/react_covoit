import './loginForm.style.css';
import { ChangeEvent, FormEvent, useState } from "react";
import { useLocalStorage } from "../../Hooks/useLocalStorage"
import { forgotPassword, loginUser} from "../../services/api/auth"
import { Button, Col, Form, InputGroup, Modal, Row } from "react-bootstrap"
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function LoginForm() {

    const [showModal, setShowModal] = useState(false);
    // variable token qui sera stocker dans le localStrorage
    const ACCESSTOKEN = "accessToken";
    // variables refreshToken qui sera stocker dans le localStorage
    const REFRESHTOKEN = "refreshToken";
    // variables user qui sera stocker dans le localStorage
    const USER = "user";
    const [storeUser, setStoreUser] = useLocalStorage(USER, '');

    
    const [user, setUser] = useState({
        email: "",
        password: "",
    });

    const [sentEmail, setSentEmail] = useState({
        email: ""
    });

     const showToastSuccess = () => {
        toast.success('Authentification Reussi !!', {
            position: toast.POSITION.TOP_RIGHT
        });
    };

    const showToastError = () => {
        toast.error('Authentification invalide !!', {
            position: toast.POSITION.TOP_RIGHT
        });
    };

     const showToastSuccessResetPassword = () => {
        toast.success('Mail pour rénitialiser mot de passe envoyé !!', {
            position: toast.POSITION.TOP_RIGHT
        });
    };

    const showToastErrorResetPassword = () => {
        toast.error('Mail pour rénitialiser mot de passe invalide !!', {
            position: toast.POSITION.TOP_RIGHT
        });
    };
    
    // Function sends login form
    const handleLoginForm = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Login clicked');
        try {
            const response = await loginUser(user);
            console.log("🚀 ~ file: LoginForm.tsx:32 ~ handleLoginForm ~ response:", response)
            if (response) {
                // stocke le accessToken dans le localStorage
                localStorage.setItem(ACCESSTOKEN,response.data.datas.tokens.accessToken);
                // stock le refreshToken dans le localStrorage
                localStorage.setItem(REFRESHTOKEN,response.data.datas.tokens.refreshToken);
                // stock le userConnected dans le localStorage
                setStoreUser(response.data.datas.user);      
                // setStoreUser(response.data.user.ADMIN)
                // location.href = "/user/dashboard";
            }
            showToastSuccess();
            // on récupère les datas user dans une const
            const users = localStorage.getItem('user');
            // on convertit le localStorage en object JS
            const data = JSON.parse(users);
            if (data.associations[0].role === "Admin" && data.associations[0]._id !== "" ) {
                location.href = "/admin/dashboard";
            }
            else if (data.associations[0]._id === "" && data.associations[0].role === "Admin" ) {
                location.href = "/admin/association/create/" + data._id;
            }
            else if (data.associations[0].role === "User") {
                location.href = "/user/dashboard";
            } else {
                showToastError()
            }
            
        } catch (error) {
            throw new Error("Echec de l'authentification " + error);  
        }
    };
    
    // Set value inputs login form
    const handleChange = (e: ChangeEvent<HTMLInputElement>):void => {
    const { name, value }: any = e.target;
    setUser({ ...user, [name]: value });
  };

  // Set value input modal sent email for resete password
    const handleSentEmailChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value }: any = e.target;
        setSentEmail({ ...sentEmail, [name]: value });
  };

    const openModal = () => {
        setShowModal(true)
    };

    const closeModal = () => {
        setShowModal(false)
    };

    // Function sent email reset password
    const handleSubmitEmail = async (e: FormEvent<HTMLFormElement | HTMLButtonElement>) => {
        e.preventDefault()
        const response = await forgotPassword(sentEmail)
        try {
            if (response) {
            // return response;  
            showToastSuccessResetPassword()
            } else {
            showToastErrorResetPassword();   
            }
        } catch (error) {
            showToastErrorResetPassword(); 
            throw new Error("Echec de l'envoi de mail pour mot de passe oublié " + error);
        }
    };

  return (
      <div className="d-flex justify-content-center algn-items-center mt-5">
          <form onSubmit={(e) => handleLoginForm(e)} className="d-flex flex-column">
              <input 
                className="form-label mt-3"
                type="text" 
                onChange={(e) => handleChange(e)} 
                name="email" 
                id="email" 
                placeholder="Email" 
              />
              <input 
                className="form-label mt-3"
                type="password" 
                onChange={(e) => handleChange(e)} 
                name="password"
                id="password" 
                placeholder="Mot de passe" 
              />
              <input className="btn btn-primary mt-5" type="submit" value="Se connecter" />
              <ToastContainer/>
              <span className="text-center mt-5 text-primary forgotPassword" onClick={openModal}>Mot de passe oublié ?</span>
              {showModal && (
                  <Modal show={showModal} onHide={closeModal} animation={false}>
                    <Form onSubmit={handleSubmitEmail}>
                      <Modal.Header closeButton>
                          <Modal.Title>Renseignez votre email</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                              <Row className="mb-3">
                                  <Form.Group as={Col} md="12" controlId="validationCustomUsername">
                                      <Form.Label>Email</Form.Label>
                                      <InputGroup hasValidation>
                                          <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                                          <Form.Control
                                              type="text"
                                              onChange={(e) => handleSentEmailChange(e)}
                                              name="email"
                                              placeholder="User-email"
                                              aria-describedby="inputGroupPrepend"
                                              required
                                          />
                                          <Form.Control.Feedback type="invalid">
                                           Svp rentrer votre email.
                                          </Form.Control.Feedback>
                                      </InputGroup>
                                  </Form.Group>
                              </Row> 
                      </Modal.Body>
                      <Modal.Footer>
                          <Button variant="secondary" onClick={closeModal}>
                            Fermer
                          </Button>
                            <Button type="submit" variant="primary" onClick={handleSubmitEmail}>
                            Envoyer
                            </Button>
                            <ToastContainer/>
                      </Modal.Footer>
                  </Form>   
                </Modal>
              )}
          </form>
    </div>
  )
}
