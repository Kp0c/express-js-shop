const deleteProduct = async (btn) => {
  const productId = btn.parentNode.querySelector('#productId').value;
  const csrfToken = btn.parentNode.querySelector('#csrfToken').value;

  const url = `/admin/products/${productId}`;
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'csrf-token': csrfToken,
    },
  };

  const response = await fetch(url, options);
  const responseJson = await response.json();

  if (responseJson.success) {
    const productCard = document.getElementById(`product-card-${responseJson.productId}`);
    productCard.remove();
  }
}
