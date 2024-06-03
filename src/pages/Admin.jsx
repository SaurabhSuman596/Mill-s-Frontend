import {
  FormGroup,
  Modal,
  Typography,
  Button as MuiButton,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import TextInput from '../components/TextInput';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { deleteProduct, postNewProduct, updateSingleProduct } from '../api';
import { lightTheme } from '../utils/Themes';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { getAllProducts } from '../api';
import { useTheme } from '@mui/material/styles';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(categoryList, category, theme) {
  return {
    fontWeight:
      category?.indexOf(categoryList) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const AdminContainer = styled.div`
  background-color: ${({ theme }) => theme.bg};
  max-width: 1440px;
  padding: 0 24px;
  font-size: 1rem;
`;

const Heading = styled.h1`
  color: ${({ theme }) => theme.primary};
  font-size: 1.3rem;
`;

const Box = styled.div`
  height: 75vh;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid ${({ theme }) => theme.shadow};
  box-shadow: 0 0 2px ${({ theme }) => theme.shadow};
  padding: 30px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.bg};
  overflow-y: scroll;
  width: 50vw;
  @media screen and (max-width: 768px) {
    width: 90%;
    margin: 0;
    height: 100%;
  }
`;

const Label = styled.label`
  font-size: 12px;
  color: ${({ theme }) => theme.primary};
  padding: 0px 4px;
  ${({ error, theme }) =>
    error &&
    `
    color: ${theme.red};
  `}
  ${({ small }) =>
    small &&
    `
    font-size: 8px;
  `}
  ${({ popup, theme }) =>
    popup &&
    `
  color: ${theme.popup_text_secondary};
  `}
`;

const Admin = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [product, setProduct] = useState({
    title: '',
    name: '',
    desc: '',
    img: '',
    price: {
      org: 0,
      mrp: 0,
      off: 0,
    },
    sizes: [],
    category: [],
  });
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [submitButtonClicked, setSubmitButtonClicked] = useState(false);
  const [products, setProducts] = useState([]);
  const [updateProduct, setUpdateProduct] = useState(false);
  const theme = useTheme();

  const handleCategoryChange = (event) => {
    const {
      target: { value },
    } = event;
    setProduct({
      ...product,
      category: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const getProducts = async () => {
    setLoading(true);
    await getAllProducts().then((res) => {
      setProducts(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleproductSize = (e, size) => {
    if (e.target.checked) {
      setProduct({ ...product, sizes: [...product.sizes, size] });
    } else {
      setProduct({
        ...product,
        sizes: product.sizes.filter((item) => item !== size),
      });
    }
  };

  const handleModelSubmitButton = async () => {
    console.log(product);
    setSubmitButtonClicked(true);
    let validateValue = true;
    setLoading(true);
    setButtonDisabled(true);
    for (const [key, value] of Object.entries(product)) {
      if (!value) {
        validateValue = false;
      }
    }
    if (!product.price.mrp && !product.price.off && !product.price.org) {
      validateValue = false;
    }

    if (validateValue) {
      const token = localStorage.getItem("mill's-fashion");
      if (updateProduct) {
        await updateSingleProduct({ ...product }, token, product.id)
          .then((res) => {
            setLoading(false);
            setButtonDisabled(false);
            setOpen(false);
            setUpdateProduct(false);
            getProducts();
            setProduct({
              title: '',
              name: '',
              desc: '',
              img: '',
              price: {
                org: 0,
                mrp: 0,
                off: 0,
              },
              sizes: [],
              category: [],
            });
          })
          .catch((err) => {
            setLoading(false);
            setButtonDisabled(false);
            alert(err.response.data.message);
            setOpen(false);
            setUpdateProduct(false);
          });
      } else {
        await postNewProduct({ ...product }, token)
          .then((res) => {
            setLoading(false);
            setButtonDisabled(false);
            setOpen(false);
            getProducts();
            setProduct({
              title: '',
              name: '',
              desc: '',
              img: '',
              price: {
                org: 0,
                mrp: 0,
                off: 0,
              },
              sizes: [],
              category: [],
            });
          })
          .catch((err) => {
            setLoading(false);
            setButtonDisabled(false);
            alert(err.response.data.message);
            setOpen(false);
          });
      }
    }
  };

  const handleProductDelete = async (item) => {
    setLoading(true);
    const token = localStorage.getItem("mill's-fashion");
    await deleteProduct(item._id, token)
      .then((res) => {
        setLoading(false);
        alert('Product deleted');
        getProducts();
      })
      .catch((err) => alert(err.message));
  };

  const handleUpdateProduct = async (item) => {
    product.title = item.title;
    product.name = item.name;
    product.desc = item.desc;
    product.img = item.img;
    product.price = item.price;
    product.sizes = item.sizes;
    product.category = item.category;
    product.id = item._id;
    handleOpen();
    setUpdateProduct(true);
  };

  const categories = [
    'Men',
    'Women',
    'Kids',
    'Bags',
    'Accessories',
    'Casual Wear',
    'Formal Wear',
    'Winter Wear',
    'Ethnic Wear',
  ];

  return (
    <AdminContainer>
      <MuiButton
        sx={{
          backgroundColor: lightTheme.primary,
          color: lightTheme.bg,
          float: 'right',
        }}
        onClick={handleOpen}
      >
        Add Product
      </MuiButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          <Heading>Add Product</Heading>
          <TextInput
            label="Product Title"
            value={product?.title}
            placeholder="Product Title"
            handelChange={(e) =>
              setProduct({ ...product, title: e.target.value })
            }
            error={
              !product.title && submitButtonClicked
                ? 'Please add product title'
                : ''
            }
          />
          <TextInput
            label="Product Name"
            placeholder="Product Name"
            value={product?.name}
            handelChange={(e) =>
              setProduct({ ...product, name: e.target.value })
            }
            error={
              !product.name && submitButtonClicked
                ? 'Please add product name'
                : ''
            }
          />
          <TextInput
            label="Product Desc"
            textArea
            placeholder="Product Description"
            value={product?.desc}
            handelChange={(e) =>
              setProduct({ ...product, desc: e.target.value })
            }
            error={
              !product.desc && submitButtonClicked
                ? 'Please add product description'
                : ''
            }
          />
          <Typography>Price</Typography>
          <TextInput
            label="Original Price"
            placeholder="Original Price"
            value={product?.price?.org}
            handelChange={(e) =>
              setProduct(
                (e = {
                  ...product,
                  price: {
                    ...product.price,
                    org: e.target.value,
                  },
                })
              )
            }
            error={
              !product?.price?.org && submitButtonClicked
                ? 'Please add original price'
                : ''
            }
          />
          <TextInput
            label="Mrp Price"
            placeholder="Mrp Price"
            value={product?.price?.mrp}
            handelChange={(e) =>
              setProduct(
                (e = {
                  ...product,
                  price: {
                    ...product?.price,
                    mrp: e.target.value,
                  },
                })
              )
            }
            error={
              !product.price?.mrp && submitButtonClicked
                ? 'Please add Market Price (MRP)'
                : ''
            }
          />
          <TextInput
            label="Off Price"
            placeholder="Off Price"
            value={product?.price?.off}
            handelChange={(e) =>
              setProduct(
                (e = {
                  ...product,
                  price: {
                    ...product?.price,
                    off: e.target.value,
                  },
                })
              )
            }
            error={
              !product.price?.off && submitButtonClicked
                ? 'Please add Discount Price'
                : ''
            }
          />
          <TextInput
            label="Link of Image"
            placeholder="Link of the product Image"
            value={product?.img}
            handelChange={(e) =>
              setProduct({ ...product, img: e.target.value })
            }
            error={
              !product.img && submitButtonClicked
                ? 'Please add an image link'
                : ''
            }
          />
          <Typography>Size</Typography>
          {product.sizes?.length === 0 && submitButtonClicked ? (
            <Label error={'Please select any sizes'}>
              Please select any sizes
            </Label>
          ) : (
            ''
          )}

          <FormGroup sx={{ display: 'inline' }}>
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked={product?.sizes && product?.sizes[0] && true}
                />
              }
              label="S"
              onClick={(e) => handleproductSize(e, 'S')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked={product?.sizes && product?.sizes[1] && true}
                />
              }
              label="M"
              onClick={(e) => handleproductSize(e, 'M')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked={product?.sizes && product?.sizes[2] && true}
                />
              }
              label="L"
              onClick={(e) => handleproductSize(e, 'L')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked={product?.sizes && product?.sizes[3] && true}
                />
              }
              label="XL"
              onClick={(e) => handleproductSize(e, 'XL')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked={product?.sizes && product?.sizes[4] && true}
                />
              }
              label="XLL"
              onClick={(e) => handleproductSize(e, 'XLL')}
            />
          </FormGroup>
          <Typography sx={{ marginBottom: '10px' }}>Category</Typography>
          {product.category?.length === 0 && submitButtonClicked ? (
            <Label error={'Please select atleast 1 category'}>
              Please select any sizes
            </Label>
          ) : (
            ''
          )}
          <FormControl sx={{ width: 300 }}>
            <InputLabel id="demo-multiple-name-label">Category</InputLabel>
            <Select
              labelId="demo-multiple-name-label"
              id="demo-multiple-name"
              multiple
              value={product.category}
              onChange={handleCategoryChange}
              input={<OutlinedInput label="Categories" />}
              MenuProps={MenuProps}
            >
              {categories?.map((category) => (
                <MenuItem
                  key={category}
                  value={category}
                  style={getStyles(categories, product?.category, theme)}
                >
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <MuiButton
            onClick={handleModelSubmitButton}
            sx={{
              float: 'right',
              backgroundColor: lightTheme.primary,
              color: lightTheme.bg,
            }}
          >
            Submit
          </MuiButton>
        </Box>
      </Modal>
      <Typography
        sx={{
          fontSize: '1.4rem',
          color: lightTheme.primary,
          padding: 'inherit',
        }}
      >
        All Products
      </Typography>
      <ul
        style={{
          width: 'max-content',
        }}
      >
        {products?.map((item) => (
          <ListItem
            alignItems="flex-start"
            sx={{
              width: '100%',
              maxHeight: '100px',
              marginBottom: '20px',
              bgcolor: lightTheme.menu_primary_text,
              flexWrap: 'wrap',
            }}
            key={item?._id}
          >
            <img
              style={{
                height: '80px',
                marginRight: '20px',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              src={item.img}
              alt=""
            />
            <ListItemText
              primary={item.title}
              secondary={
                <>
                  <Typography
                    sx={{ display: 'inline' }}
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {item.name}
                  </Typography>
                  <br />
                  {item.desc.substr(0, 80) + '...'}
                </>
              }
            />
            <EditIcon onClick={() => handleUpdateProduct(item)} />
            <DeleteIcon onClick={() => handleProductDelete(item)} />
          </ListItem>
        ))}
      </ul>
    </AdminContainer>
  );
};

export default Admin;
