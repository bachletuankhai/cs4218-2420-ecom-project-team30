import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateProduct from './CreateProduct';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import '@testing-library/jest-dom';
import { TbRuler3 } from 'react-icons/tb';

jest.mock('axios');

jest.mock('antd', () => {
  const actualAntd = jest.requireActual('antd');
  const MockSelect = ({ children, onChange, 'data-testid': testId }) => (
    <select data-testid={testId} onChange={(e) => onChange(e.target.value)}>
      {children}
    </select>
  );

  MockSelect.Option = ({ children, value, 'data-testid': testId }) => (
    <option value={value} data-testid={testId}>
      {children}
    </option>
  );

  return { ...actualAntd, Select: MockSelect };
});

jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}));

jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(() => [
    {
      user: {
        name: 'Admin',
        email: 'admin@example.com',
        phone: '123-456-7890',
      },
    },
  ]),
}));

// Mock the Layout component
jest.mock('../../components/Layout', () => {
  return function MockLayout({ children }) {
    return (
      <div data-testid="mock-layout">
        {children} {/* Render the children passed to Layout */}
      </div>
    );
  };
});

// Mock the AdminMenu component
jest.mock('../../components/AdminMenu', () => {
  return function MockAdminMenu() {
    return <div data-testid="mock-admin-menu">Mock AdminMenu</div>;
  };
});

describe('CreateProduct Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // test('renders the create product form', async () => {
  //   render(
  //     <BrowserRouter>
  //       <CreateProduct />
  //     </BrowserRouter>
  //   );

  //   expect(await screen.findByText('Create Product')).toBeInTheDocument();
  //   expect(screen.getByPlaceholderText('write a name')).toBeInTheDocument();
  //   expect(
  //     screen.getByPlaceholderText('write a description')
  //   ).toBeInTheDocument();
  //   expect(screen.getByPlaceholderText('write a Price')).toBeInTheDocument();
  //   expect(screen.getByPlaceholderText('write a quantity')).toBeInTheDocument();
  //   expect(screen.getByText('Upload Photo')).toBeInTheDocument();
  //   expect(screen.getByText('Select a category')).toBeInTheDocument();
  // });

  test('fetches and displays categories', async () => {
    // Mock the axios.get response
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        category: [{ _id: '1', name: 'Test Category' }],
      },
    });

    // Render the component
    render(
      <BrowserRouter>
        <CreateProduct />
      </BrowserRouter>
    );

    // Wait for the API call to complete
    await waitFor(() => {
      expect(screen.queryAllByTestId(/category-option/)).toHaveLength(1);
    });

    expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
  });

  test('fills out and submits the form successfully', async () => {
    // Mock the axios.post response
    axios.post.mockResolvedValue({ data: { success: true } });

    render(
      <BrowserRouter>
        <CreateProduct />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('write a name'), {
      target: { value: 'New Product' },
    });
    fireEvent.change(screen.getByPlaceholderText('write a description'), {
      target: { value: 'This is a test product' },
    });
    fireEvent.change(screen.getByPlaceholderText('write a Price'), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getByPlaceholderText('write a quantity'), {
      target: { value: '10' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('CREATE PRODUCT'));

    // Wait for the API call to be made
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
  });

  test('shows error toast on API failure', async () => {
    // Mock the axios.post to reject with an error
    axios.post.mockResolvedValue({
      data: { success: false, message: 'test fail' },
    });
    // Mock the axios.get response
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        category: [{ _id: '1', name: 'Test Category' }],
      },
    });

    render(
      <BrowserRouter>
        <CreateProduct />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('write a name'), {
      target: { value: 'New Product' },
    });
    fireEvent.change(screen.getByPlaceholderText('write a description'), {
      target: { value: 'This is a test product' },
    });
    fireEvent.change(screen.getByPlaceholderText('write a Price'), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getByPlaceholderText('write a quantity'), {
      target: { value: '10' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('CREATE PRODUCT'));

    // Wait for the toast to be called
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('test fail'));
  });

  test('shows something went wrong error toast on API failure', async () => {
    // Mock the axios.post to reject with an error
    axios.post.mockRejectedValue(new Error('error'));

    // Mock the axios.get response
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        category: [{ _id: '1', name: 'Test Category' }],
      },
    });

    render(
      <BrowserRouter>
        <CreateProduct />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('write a name'), {
      target: { value: 'New Product' },
    });
    fireEvent.change(screen.getByPlaceholderText('write a description'), {
      target: { value: 'This is a test product' },
    });
    fireEvent.change(screen.getByPlaceholderText('write a Price'), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getByPlaceholderText('write a quantity'), {
      target: { value: '10' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('CREATE PRODUCT'));

    // Wait for the toast to be called
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('something went wrong')
    );
  });

  test('shows error toast on get API failure', async () => {
    // Mock the axios.get response to return success: false
    axios.get.mockResolvedValueOnce({
      data: {
        success: false,
      },
    });

    // Render the component
    render(
      <BrowserRouter>
        <CreateProduct />
      </BrowserRouter>
    );

    // Wait for the toast to be called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong in getting category'
      );
    });
  });
});
