import axios from 'axios';
import React, {useState, useEffect} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mediaUrl } from '../api';

const UpdateProd = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const routeState = location.state || {};

    const [image, setImage] = useState(null)
    const [name, setName] = useState(null)
    const [description, setdescription] = useState(null)
    const [price, setprice] = useState(null)
    const [warranty_period, setwarranty_period] = useState(null)

   let loadProducts = async () => {
    if (!routeState.id) return;
    const result = await axios.get(`/api/product/${routeState.id}/`);
    
    console.log(result.data.name);
    setImage(result.data.image);
    setName(result.data.name);
    setdescription(result.data.description);
    setwarranty_period(result.data.warranty_period);
    setprice(result.data.price);
   }

   const updateSingleProduct = async () => {
        let formField = new FormData()

        formField.append('name',name)
        formField.append('description',description)
        formField.append('price',price)
        formField.append('warranty_period',warranty_period)

        if(image !== null) {
          formField.append('image', image)
        }

        await axios({
            method: 'PUT',
            url: `/api/product/${routeState.r_id || localStorage.getItem('user_id')}/${routeState.id}/update/`,
            data: formField
        }).then(response => {
            console.log(response.data);
            navigate('/');
        })

    } 
    
    useEffect(() => { loadProducts(); }, [routeState.id]);

    return (
        <main className="page-wrap"><div className="store-container"><div className="admin-form">
            <p className="eyebrow">STORE MANAGEMENT</p><h2>Update product</h2>
    
            
              <div className="form-group">
              <label>Product image</label><br></br>
                <img className="admin-image-preview" src={image instanceof File ? URL.createObjectURL(image) : mediaUrl(image)} alt="Product preview" />
                  
                  <input style={{fontFamily: "arial"}} type="file" className="form-control" defaultValue={image} onChange={(e)=>setImage(e.target.files[0])}/>
              </div>

              <div className="form-group">
              <label>Product name</label><br></br>
                <input style={{fontFamily: "arial"}}
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Enter Your Name"
                  name="name"
                  value={name}
                  defaultValue={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            
              <div className="form-group">
              <label>Description</label><br></br>
                <input style={{fontFamily: "arial"}}
                  type="description"
                  className="form-control form-control-lg"
                  placeholder="Enter Description"
                  name="description"
                  value={description}
                  defaultValue={description}
                  onChange={(e) => setdescription(e.target.value)}
                />
              </div>
              <div className="form-group">
              <label>Warranty period (years)</label><br></br>
                <input style={{fontFamily: "arial"}}
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Enter Your warranty_period"
                  name="warranty_period"
                  value={warranty_period}
                  defaultValue={warranty_period}
                  onChange={(e) => setwarranty_period(e.target.value)}
                />
              </div>
              <div className="form-group">
              <label>Price (INR)</label><br></br>
                <input style={{fontFamily: "arial"}}
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Enter Your price Name"
                  name="price"
                  value={price}
                  defaultValue={price}
                  onChange={(e) => setprice(e.target.value)}
                />
              </div>
              <button style={{fontFamily: "arial"}} onClick={updateSingleProduct} className="btn btn-primary btn-block">Save changes</button>
          
        </div></div></main>
 
    );
};

export default UpdateProd;
