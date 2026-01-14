'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Typography,
  Paper,
  Grid
} from '@mui/material';
import { WarehouseData } from '@/types';
import { warehouseAPI } from '@/lib/api';
import statesCities from '../../data/statesCities.json';
import { useRouter } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';
const validationSchema = Yup.object({
  // Warehouse name
  warehouse_name: Yup.string()
    .trim()
    .min(3, 'Warehouse name must be at least 3 characters')
    .max(100, 'Warehouse name is too long')
    .required('Warehouse name is required'),

  // Address
  address1: Yup.string()
    .trim()
    .min(5, 'Address is too short')
    .max(200, 'Address is too long')
    .required('Address is required'),

  address2: Yup.string()
    .trim()
    .max(200, 'Address is too long')
    .nullable(),

  // Area / Locality
  areaLocality: Yup.string()
    .trim()
    .min(3, 'Area / Locality is too short')
    .max(100, 'Area / Locality is too long')
    .required('Area / Locality is required'),

  // Location
  state: Yup.string()
    .required('State is required'),

  city: Yup.string()
    .required('City is required'),

  // Pincode (6 digits, cannot start with 0)
  pincode: Yup.string()
    .required('Pincode is required')
    .matches(/^[1-9][0-9]{5}$/, 'Pincode must be 6 digits and not start with 0'),

  // GST number (India)
  gstno: Yup.string()
    .transform((v) => v?.toUpperCase())
    .matches(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      'Invalid GST number'
    )
    .nullable(),

  // Warehouse size info
  totalLotArea: Yup.number()
    .typeError('Total lot area must be a number')
    .positive('Total lot area must be greater than 0')
    .required('Total lot area is required'),

  coveredArea: Yup.number()
    .typeError('Covered area must be a number')
    .positive('Covered area must be greater than 0')
    .max(Yup.ref('totalLotArea'), 'Covered area cannot exceed total lot area')
    .required('Covered area is required'),

  storageHeight: Yup.number()
    .typeError('Storage height must be a number')
    .min(5, 'Storage height must be at least 5 ft')
    .max(60, 'Storage height seems unrealistic')
    .required('Storage height is required'),

  // Optional numeric fields
  noOfDocs: Yup.number()
    .integer('Must be a whole number')
    .min(0, 'Cannot be negative')
    .nullable(),

  noOfGate: Yup.number()
    .integer('Must be a whole number')
    .min(0, 'Cannot be negative')
    .nullable(),

  parkingArea: Yup.number()
    .min(0, 'Parking area cannot be negative')
    .nullable(),

  // Status
  status: Yup.string()
    .oneOf(['publish', 'unpublish'])
    .required('Status is required'),

  // Images
  warehouseImages: Yup.array()
    .max(4, 'You can upload maximum 4 images')
    .of(
      Yup.mixed<File>()
        .test(
          'fileSize',
          'Each image must be under 5MB',
          (file) => !file || file.size <= 5 * 1024 * 1024
        )
        .test(
          'fileType',
          'Only JPG or PNG images are allowed',
          (file) => !file || ['image/jpeg', 'image/png'].includes(file.type)
        )
    ),
});


export default function ListSpacePage({ warehouseId }: { warehouseId: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');
  const idNum = id ? Number(id) : undefined;
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [initialValues, setInitialValues] = React.useState<WarehouseData | null>(null);
  const [images, setImages] = React.useState<(File | null)[]>([null, null, null, null]);
  const [previews, setPreviews] = React.useState<(string | null)[]>([null, null, null, null]);
  const defaultValues: WarehouseData = {
    id: 0,
    warehouseId: '',
    warehouse_name: '',
    address1: '',
    address2: '',
    areaLocality: '',
    state: '',
    city: '',
    pincode: '',
    gstno: '',
    totalLotArea: 0,
    coveredArea: 0,
    noOfDocs: undefined,
    noOfGate: undefined,
    storageHeight: 0,
    parkingArea: undefined,
    status: 'unpublish',
    warehouseImages: []
  };

  const [cityOptions, setCityOptions] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchForEdit = async () => {
      if (!idNum && idNum !== 0) return;
      try {
        const res = await warehouseAPI.getById(idNum);
        const data = res.data.data;
        if (data) setInitialValues(data);
      } catch (err) {
        console.error('Failed to load warehouse for edit', err);
      }
    };
    fetchForEdit();
  }, [idNum]);

  React.useEffect(() => {
    const st = initialValues?.state;
    if (st) {
      const found = (statesCities as any[]).find((s) => s.state === st);
      setCityOptions(found ? found.cities : []);
    }
  }, [initialValues]);

  const formik = useFormik<WarehouseData>({
    initialValues: initialValues || defaultValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        // 1. Prepare normal numeric payload
        const payload = {
          ...values,
          totalLotArea: Number(values.totalLotArea),
          coveredArea: Number(values.coveredArea),
          noOfDocs: values.noOfDocs ? Number(values.noOfDocs) : undefined,
          noOfGate: values.noOfGate ? Number(values.noOfGate) : undefined,
          storageHeight: values.storageHeight ? Number(values.storageHeight) : undefined,
          parkingArea: values.parkingArea ? Number(values.parkingArea) : undefined,
        };

        // 2. Convert to FormData
        const formData = new FormData();

        Object.entries(values).forEach(([key, value]) => {
          if (key !== 'warehouseImages' && value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });


        // 3. Append Images (max 4 already enforced in your state)
        images
          .filter(Boolean)
          .forEach((file) => {
            formData.append('warehouseImages[]', file as File);
          });

        // 4. Send to API
        if (typeof idNum === 'number' && !isNaN(idNum)) {
          await warehouseAPI.updateWarehouse(idNum, formData);
        } else {
          await warehouseAPI.createWarehouse(formData);
        }

        // 5. Reset and redirect
        formik.resetForm();
        setImages([]);
        setSubmitError(null);
        router.push('/dashboard');

      } catch (err) {
        const msg =
          (err as any)?.response?.data?.message ||
          (err as any)?.message ||
          'Submission failed';
        setSubmitError(String(msg));
      }
    },
  });

  React.useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    let selectedFiles = Array.from(files);

    // limit total images to 4
    const total = images.length + selectedFiles.length;
    if (total > 4) {
      selectedFiles = selectedFiles.slice(0, 4 - images.length);
    }

    const updated = [...images, ...selectedFiles].slice(0, 4);
    setImages(updated);
    formik.setFieldValue('warehouseImages', updated);
  };

  const handleCancel = () => router.push('/dashboard');

  const handleSingleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const updatedImages = [...images];
    const updatedPreviews = [...previews];

    updatedImages[index] = file;
    updatedPreviews[index] = URL.createObjectURL(file);

    setImages(updatedImages);
    setPreviews(updatedPreviews);

    // Update formik (remove nulls)
    formik.setFieldValue(
      'warehouseImages',
      updatedImages.filter(Boolean)
    );
  };



  const smallFieldStyle = {
    '& .MuiInputBase-root': { height: 26, fontSize: 11 },
    '& .MuiInputLabel-root': { fontSize: 11, top: -4 },
    mb: 0.3,
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        p: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#f7f7f7',
        overflow: 'hidden',
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: '98vw',
          maxWidth: '1200px',
          minHeight: '90vh',
          maxHeight: '95vh',
          p: 2,
          border: '1px solid #19191bff',
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 20, mr: 2 }}>
            <HomeIcon sx={{ color: '#1411e4', fontSize: 25, mr: 1 }} />
            {id ? 'Edit Warehouse' : 'Add Warehouse'}
          </Typography>
        </Box>
        <Box sx={{ borderBottom: '1.5px solid #121213ff', mb: 2 }} />
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>

          {/* Basic Information Section */}
          <Typography fontWeight={700} sx={{ fontSize: 13, mb: 0.5 }}>Basic Information</Typography>
          <Grid container spacing={4} mb={1.5}>
            {/* Left Column */}
            <Grid item xs={6}>
              <Box display="flex" flexDirection="column" gap={1} pl={20}>
                <FormField label="Warehouse Name" name="warehouse_name" required formik={formik} inputWidth={240} />
                <FormField label="Address Line 2" name="address2" formik={formik} inputWidth={240} />
                <FormField label="State" name="state" required formik={formik} type="select" options={(statesCities as any[]).map((s) => s.state)} inputWidth={240} onChange={(e: any) => {
                  const value = e.target.value;
                  formik.setFieldValue('state', value);
                  const found = (statesCities as any[]).find((s) => s.state === value);
                  setCityOptions(found ? found.cities : []);
                  formik.setFieldValue('city', '');
                }} />
                <FormField label="Pincode" name="pincode" required formik={formik} inputWidth={240} />
              </Box>
            </Grid>
            {/* Right Column */}
            <Grid item xs={6}>
              <Box display="flex" flexDirection="column" gap={1} pl={3}>
                <FormField label="Address Line 1" name="address1" required formik={formik} inputWidth={240} />
                <FormField label="Area / Locality" name="areaLocality" required formik={formik} inputWidth={240} />
                <FormField label="City" name="city" required formik={formik} type="select" options={cityOptions} inputWidth={240} />
                <FormField label="GST No." name="gstno" formik={formik} inputWidth={240} />
              </Box>
            </Grid>
          </Grid>
          {/* Warehouse Information Section */}
          <Typography fontWeight={700} sx={{ fontSize: 13, mb: 0.5 }}>Warehouse Information</Typography>
          <Grid container spacing={4} mb={1.5}>
            {/* Left Column */}
            <Grid item xs={6}>
              <Box display="flex" flexDirection="column" gap={1} pl={20}>
                <FormField label="Total Plot Area (sqft)" name="totalLotArea" required formik={formik} type="number" inputWidth={240} />
                <FormField label="No. of Docks" name="noOfDocs" formik={formik} type="number" inputWidth={240} />
                <FormField label="Storage Height (ft)" name="storageHeight" required formik={formik} type="number" inputWidth={240} />
              </Box>
            </Grid>
            {/* Right Column */}
            <Grid item xs={6}>
              <Box display="flex" flexDirection="column" gap={1} pl={3}>
                <FormField label="Covered Area (sqft)" name="coveredArea" required formik={formik} type="number" inputWidth={240} />
                <FormField label="No. of Gates" name="noOfGate" formik={formik} type="number" inputWidth={240} />
                <FormField label="Parking Area (sqft)" name="parkingArea" formik={formik} type="number" inputWidth={240} />
              </Box>
            </Grid>
          </Grid>
          {/* Warehouse Photo Gallery + Status */}
          <Typography fontWeight={700} sx={{ fontSize: 13, mb: 0.5 }}>
            Warehouse Photo Gallery
          </Typography>

          <Grid container spacing={4} mb={1.5}>
            {/* LEFT COLUMN – IMAGES */}
            <Grid item xs={6}>
              <Box display="flex" flexDirection="column" gap={0.8} pl={20}>

                {[
                  'Front View Photo',
                  'Docks / Gate View Photo',
                  'Covered Area Photo',
                  'Outside Photo',
                ].map((label, index) => (
                  <Box key={index}>
                    <Box display="flex" alignItems="center">
                      {/* Label */}
                      <Typography
                        sx={{
                          fontSize: 10,
                          minWidth: 130,
                          fontWeight: 500,
                        }}
                      >
                        {label} :
                      </Typography>

                      {/* Hidden input */}
                      <input
                        id={`imageUpload-${index}`}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleSingleImageUpload(e, index)}
                      />

                      {/* File input look-alike */}
                      <label htmlFor={`imageUpload-${index}`}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #c4c4c4',
                            borderRadius: 0.5,
                            height: 22,
                            width: 320,
                            ml: 1,
                            px: 0.5,
                            cursor: 'pointer',
                            bgcolor: '#fff',
                            gap: 0.5,
                          }}
                        >
                          {/* Choose File button look */}
                          <Typography
                            sx={{
                              fontSize: 9,
                              px: 0.8,
                              py: 0.2,
                              border: '1px solid #c4c4c4',
                              borderRadius: 0.5,
                              bgcolor: '#f5f5f5',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Choose File
                          </Typography>

                          {/* File name */}
                          <Typography
                            sx={{
                              fontSize: 9,
                              color: images[index] ? '#000' : '#888',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 150,
                            }}
                          >
                            {images[index]?.name || 'No file chosen'}
                          </Typography>

                          {/* ✅ SMALL IMAGE INSIDE SAME BOX */}
                          {images[index] && (
                            <Box
                              sx={{
                                ml: 'auto',
                                width: 50,
                                height: 18,
                                border: '1px solid #c4c4c4',
                                borderRadius: 0.5,
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: '#fafafa',
                              }}
                            >
                              <img
                                src={URL.createObjectURL(images[index] as File)}
                                alt="preview"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </label>
                    </Box>
                  </Box>
                ))}


                {/* Count */}
                <Typography sx={{ fontSize: 10, mt: 0.5, opacity: 0.7 }}>
                  {images.filter(Boolean).length}/4 images selected
                </Typography>

                {/* Validation error */}
                {formik.touched.warehouseImages && formik.errors.warehouseImages && (
                  <Typography sx={{ fontSize: 9, color: 'red' }}>
                    {String(formik.errors.warehouseImages)}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* RIGHT COLUMN – STATUS */}
            <Grid item xs={6}>
              <Box display="flex" flexDirection="column" gap={1} pl={3}>
                <Typography fontWeight={700} sx={{ fontSize: 13, mb: 2 }}>
                  Status
                </Typography>

                <FormControl size="small" sx={{ width: 120 }}>
                  <InputLabel sx={{ fontSize: 10 }}>Status</InputLabel>
                  <Select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    label="Status"
                    sx={{ height: 22, fontSize: 10 }}
                  >
                    <MenuItem value="publish">Publish</MenuItem>
                    <MenuItem value="unpublish">Unpublish</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>

          {/* Divider line before buttons */}
          <Box sx={{ borderBottom: '1.5px solid #19191bff', my: 2 }} />
          {/* Centered Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
            <Button onClick={handleCancel} variant="outlined" sx={{ height: 28, fontSize: 12, minWidth: 80 }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting} sx={{ height: 28, fontSize: 12, minWidth: 80 }}>
              {id ? 'Save' : 'Submit'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

// Helper component for form fields with label, required star, and small input
function FormField({ label, name, required, formik, type = 'text', options, onChange, inputWidth = 120 }: any) {
  const isError = formik.touched[name] && Boolean(formik.errors[name]);
  const helperText = formik.touched[name] && formik.errors[name];
  const smallFieldStyle = {
    '& .MuiInputBase-root': { height: 22, fontSize: 10 },
    '& .MuiInputLabel-root': { fontSize: 10, top: -4 },
    mb: 0.2,
    width: inputWidth,
    maxWidth: inputWidth,
  };
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={0.1}>
        <Typography sx={{ fontSize: 10, minWidth: 80, fontWeight: 500 }}>
          {label} {required && <span style={{ color: 'red' }}>*</span>} :
        </Typography>
        {type === 'select' ? (
          <FormControl size="small" sx={{ minWidth: 80, ...smallFieldStyle, flex: 1 }}>
            <InputLabel>{label}</InputLabel>
            <Select
              name={name}
              value={formik.values[name]}
              label={label}
              onChange={onChange || formik.handleChange}
              onBlur={formik.handleBlur}
              error={isError}
              sx={{ height: 22, fontSize: 10 }}
            >
              {(options || []).map((opt: string) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            name={name}
            type={type}
            value={formik.values[name] || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={isError}
            sx={{ ...smallFieldStyle, flex: 1 }}
            size="small"
            fullWidth
          />
        )}
      </Box>
      {isError && (
        <Typography color="error" fontSize={9} mt={0.1} ml={1.5}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
}