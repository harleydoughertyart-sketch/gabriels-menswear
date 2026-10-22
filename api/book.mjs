// POST /api/book: the /book form. See handleBook in api/_lib/handlers.mjs.
import { handleBook } from './_lib/handlers.mjs';
import { live } from './_lib/live.mjs';

export default { fetch: request => handleBook(request, live()) };
