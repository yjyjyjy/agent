export const jsonToHtml = (json) => {
  // Parse the JSON data
  const headers = json.headers;
  const data = json.data;
  let html = '<table style="border-collapse: collapse; border: 1px solid black;"><thead><tr>';
  headers.forEach(header => {
    html += `<th style="border: 1px solid black; padding: 5px;">${header}</th>`;
  });
  html += '</tr></thead><tbody>';
  data.forEach(row => {
    html += '<tr>';
    row.forEach(cell => {
      html += `<td style="border: 1px solid black; padding: 5px;">${cell}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  // Output the formatted data as HTML
  return html;
}


(async () => {
  try {
    const json = {
      "headers": ["category", "date and time", "from", "comment"],
      "data": [
        ["Support", "10/14/2023 4:08 PM", "@Michael_x", "I bought a course and can't login"],
        ["Collaboration", "10/14/2023 5:00 PM", "@John_t", "Let's do a reels together"],
        ["Personal", "10/14/2023 5:00 PM", "@zeld_12", "Hi Marina, haven't seen you for a while"],
        ["Leads", "10/14/2023 5:00 PM", "@Olga", "How do I pay for the course"]
      ]
    };

    const html = jsonToHtml(json);
    console.log(html);
  } catch (e) {
    // Deal with the fact the chain failed
  }
  // `text` is not available here
})();
