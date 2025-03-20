import CartPage from '@/components/pages/CartPage';

const Cart = () => {
  return (
    <div className='w-full h-[95%] max-w-9xl px-8 bg-white rounded-xl shadow-lg overflow-auto'>
      <div className='flex flex-col pt-4 w-4/5 h-full mx-auto'>
        <CartPage />
      </div>
    </div>
  );
};

export default Cart;
