const axios = require('axios');
axios.post('http://localhost:3001/api/execute', { 
  code: '#include <stdio.h>\nint main() { printf("Hello\\n"); return 0; }' 
})
.then(r => console.log(r.data))
.catch(e => console.error(e.response?.data || e.message));
