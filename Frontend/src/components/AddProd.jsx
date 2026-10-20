import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddProd = () => {

    const navigate = useNavigate();
    const [image, setImage] = useState(null)
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')
    const [warranty_period, setWarranty_period] = useState('')
    const [preview, setPreview] = useState('')

    const addNewProduct = async () => {
        let formField = new FormData()
        formField.append('name',name)
        formField.append('price',price)
        formField.append('description',description)
        formField.append('warranty_period',warranty_period)
        console.log(formField.getAll('name'));
        if(image !== null) {
          formField.append('image', image)
        }

        await axios({
          method: 'post',
          url:`/api/product/${localStorage.getItem('user_id')}/add/`,
          data: formField
        }).then(response=>{
          console.log(response.data);
          navigate('/')
        })
    }
   
    return (
        <main className="page-wrap"><div className="store-container">
              <div className="admin-form">
                <p className="eyebrow">STORE MANAGEMENT</p><h2>Add a product</h2>
                <div className="form-group">
                <label>Product image</label>{preview && <img className="admin-image-preview" src={preview} alt="Selected product preview"/>}
                    <input className="form-control-file" type="file" accept="image/*" onChange={(e)=>{const file=e.target.files[0];setImage(file);setPreview(file ? URL.createObjectURL(file) : '');}}/>
                  </div>
                  <div className="form-group">
                    <label>Product name</label><input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter Product Name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (INR)</label><input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter Price (eg 50000)"
                      name="price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Warranty period (years)</label><input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter Product Warranty period"
                      name="warranty_period"
                      value={warranty_period}
                      onChange={(e) => setWarranty_period(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Product description</label><textarea
                      className="form-control form-control-lg"
                      placeholder="Enter Product description"
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <button className="btn btn-primary btn-block" onClick={addNewProduct}>Add product</button>
              
                </div>
              </div>
        </main>
    );
};

export default AddProd;
