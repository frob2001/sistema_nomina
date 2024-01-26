using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Microsoft.Extensions.Configuration;
using Azure.Storage.Blobs.Specialized;
using Azure.Storage;
using Microsoft.AspNetCore.Authorization;



namespace webapi.Controllers
{
    [Route("ConexionDocumento")]
    [ApiController]
    public class ConexionDocumentoesController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;
        private readonly BlobServiceClient _blobServiceClient;

        public ConexionDocumentoesController(KattionDataBaseContext context, IConfiguration configuration)
        {
            _context = context;
            string connectionString = configuration.GetConnectionString("AzureBlobStorage");
            _blobServiceClient = new BlobServiceClient(connectionString);
        }

        public class DocumentoDto
        {
            public required string TablaConexion { get; set; }
            public int IdConexion { get; set; }
            public DateTime Fecha { get; set; }
            public required string Titulo { get; set; }
            public required string Descripcion { get; set; }
            public required string Usuario { get; set; }
            public required IFormFile Archivo { get; set; }
        }

        private string GenerateSasUrl(BlobClient blobClient)
        {
            // Definir los parámetros para la firma SAS
            var sasBuilder = new BlobSasBuilder
            {
                BlobContainerName = blobClient.BlobContainerName,
                BlobName = blobClient.Name,
                Resource = "b", // "b" indica que el recurso es un blob
                StartsOn = DateTimeOffset.UtcNow,
                ExpiresOn = DateTimeOffset.UtcNow.AddHours(1) // Duración de la SAS, por ejemplo, 1 hora
            };

            // Establecer permisos para la SAS (en este caso, solo lectura)
            sasBuilder.SetPermissions(BlobSasPermissions.Read);

            var sasToken = blobClient.GenerateSasUri(sasBuilder).Query;
            return $"{blobClient.Uri}{sasToken}";
        }


        [HttpGet("Buscar")]
        public async Task<ActionResult<IEnumerable<ConexionDocumento>>> GetConexionDocumentosByParameters(string tablaConexion, int idConexion)
        {
            var conexionDocumentos = await _context.ConexionDocumentos
                .Where(cd => cd.TablaConexion == tablaConexion && cd.IdConexion == idConexion)
                .ToListAsync();

            if (!conexionDocumentos.Any())
            {
                return NotFound("No se encontraron documentos con los parámetros especificados.");
            }

            return Ok(conexionDocumentos);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult> GetConexionDocumento(int id)
        {
            var conexionDocumento = await _context.ConexionDocumentos.FindAsync(id);

            if (conexionDocumento == null)
            {
                return NotFound();
            }

            var rutaBlob = $"{conexionDocumento.TablaConexion}{conexionDocumento.IdConexion}/{conexionDocumento.NombreArchivo}";

            var blobClient = _blobServiceClient.GetBlobContainerClient(conexionDocumento.TablaConexion).GetBlobClient(rutaBlob);

            var sasUrl = GenerateSasUrl(blobClient); 

            var response = new
            {
                ConexionDocumentoId = conexionDocumento.ConexionDocumentoId,
                TablaConexion = conexionDocumento.TablaConexion,
                IdConexion = conexionDocumento.IdConexion,
                Fecha = conexionDocumento.Fecha,
                Titulo = conexionDocumento.Titulo,
                Descripcion = conexionDocumento.Descripcion,
                NombreArchivo = conexionDocumento.NombreArchivo,
                Usuario = conexionDocumento.Usuario,
                UrlAcceso = sasUrl 
            };

            return Ok(response);
        }



        [HttpPost]
        public async Task<ActionResult<ConexionDocumento>> PostConexionDocumento([FromForm] DocumentoDto documentoDto)
        {
            if (_context.ConexionDocumentos == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.ConexionDocumentos' is null.");
            }

            if (documentoDto.Archivo != null && documentoDto.Archivo.Length > 0)
            {
                var contenedorNombre = documentoDto.TablaConexion;
                var contenedorClient = _blobServiceClient.GetBlobContainerClient(contenedorNombre);
                if (!await contenedorClient.ExistsAsync())
                {
                    await contenedorClient.CreateAsync();
                }

                var carpetaNombre = documentoDto.TablaConexion + documentoDto.IdConexion.ToString();
                var rutaBlob = $"{carpetaNombre}/";
                var nombreArchivoOriginal = Path.GetFileName(documentoDto.Archivo.FileName);
                var nombreBlob = $"{rutaBlob}{nombreArchivoOriginal}";
                var blobClient = contenedorClient.GetBlobClient(nombreBlob);

                if (await blobClient.ExistsAsync())
                {
                    return BadRequest("Un archivo con el mismo nombre ya existe.");
                }

                await using (var stream = documentoDto.Archivo.OpenReadStream())
                {
                    await blobClient.UploadAsync(stream, true);
                }

                var conexionDocumento = new ConexionDocumento
                {
                    TablaConexion = documentoDto.TablaConexion,
                    IdConexion = documentoDto.IdConexion,
                    Fecha = documentoDto.Fecha,
                    Titulo = documentoDto.Titulo,
                    Descripcion = documentoDto.Descripcion,
                    NombreArchivo = nombreArchivoOriginal,
                    Usuario = documentoDto.Usuario
                };
                _context.ConexionDocumentos.Add(conexionDocumento);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetConexionDocumento", new { id = conexionDocumento.ConexionDocumentoId }, conexionDocumento);
            }
            else
            {
                return BadRequest("El archivo no se proporcionó o está vacío.");
            }
        }

        // DTO para actualizar un documento
        public class DocumentoUpdateDto
        {
            public string? Titulo { get; set; }
            public string? Descripcion { get; set; }
            // Puedes agregar otros campos opcionales aquí
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchConexionDocumento(int id, [FromBody] DocumentoUpdateDto documentoUpdateDto)
        {
            var conexionDocumento = await _context.ConexionDocumentos.FindAsync(id);
            if (conexionDocumento == null)
            {
                return NotFound();
            }

            // Actualiza el título si se proporciona
            if (documentoUpdateDto.Titulo != null)
            {
                conexionDocumento.Titulo = documentoUpdateDto.Titulo;
            }

            // Actualiza la descripción si se proporciona
            if (documentoUpdateDto.Descripcion != null)
            {
                conexionDocumento.Descripcion = documentoUpdateDto.Descripcion;
            }

            // Agrega condiciones para otros campos que se pueden actualizar
            _context.ConexionDocumentos.Update(conexionDocumento);
            await _context.SaveChangesAsync();

            return Ok(conexionDocumento);
        }



        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConexionDocumento(int id)
        {
            var conexionDocumento = await _context.ConexionDocumentos.FindAsync(id);
            if (conexionDocumento == null)
            {
                return NotFound();
            }

            var containerClient = _blobServiceClient.GetBlobContainerClient(conexionDocumento.TablaConexion);

            var rutaBlob = $"{conexionDocumento.TablaConexion}{conexionDocumento.IdConexion}/{conexionDocumento.NombreArchivo}";

            var blobClient = containerClient.GetBlobClient(rutaBlob);

            await blobClient.DeleteIfExistsAsync();


            _context.ConexionDocumentos.Remove(conexionDocumento);
            await _context.SaveChangesAsync();

            return NoContent();
        }



        private bool ConexionDocumentoExists(int id)
        {
            return (_context.ConexionDocumentos?.Any(e => e.ConexionDocumentoId == id)).GetValueOrDefault();
        }

        private string GetContainerName(ConexionDocumento conexionDocumento)
        {
            return $"{conexionDocumento.TablaConexion}-{conexionDocumento.IdConexion}";
        }

        private string GetBlobName(ConexionDocumento conexionDocumento)
        {
            return Guid.NewGuid().ToString();
        }
    }
}
