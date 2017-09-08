import createElement from 'inferno-create-element'

export default function Html({ children }) {
  return (
    <html>
      <head>
        <title>My Application</title>
      </head>
      <body>
        <div id='root'>{children}</div>
      </body>
    </html>
  );
}