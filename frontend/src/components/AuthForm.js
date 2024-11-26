import React from "react";

const AuthForm = ({ title, fields, onSubmit, buttonText }) => {
  const [formData, setFormData] = React.useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 bg-white rounded shadow-md"
      >
        <h2 className="mb-6 text-2xl font-bold text-center">{title}</h2>
        {fields.map((field) => (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium">
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              id={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md"
              required
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
