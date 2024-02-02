using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using webapi.Models;
using System.Text;


namespace webapi.Controllers
{
    [Route("Usuario")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly SistemanominaContext _context;
        private readonly AwsConnection _awsConnection;

        public UsuariosController(HttpClient httpClient, SistemanominaContext context)
        {
            _httpClient = httpClient;
            _context = context;
            _awsConnection = new AwsConnection();
        }

        public class LoginDTO
        {
            public string CorreoElectronico { get; set; }
            public string Contrasena { get; set; }
            public int EmisorId { get; set; }
            public int SucursalId { get; set; }
        }

        // POST: api/Usuarios/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO loginDto)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.CorreoElectronico == loginDto.CorreoElectronico);

            if (usuario == null)
            {
                return NotFound();
            }

            if (usuario.Contrasena == loginDto.Contrasena && usuario.EmisorId == loginDto.EmisorId && usuario.SucursalId == loginDto.SucursalId)
            {
                return StatusCode(201);
            }

            return BadRequest();
        }

        public class EncryptDTO
        {
            public string email { get; set; }
        }


        [HttpPost("encryptAndSend")]
        public async Task<ActionResult<string>> EncryptAndSendData([FromBody] EncryptDTO encryptDto)
        {
            try
            {
                // Crear la solicitud JSON
                // Leer y encriptar la respuesta
                var encryptedEmail = _awsConnection.Encrypt(encryptDto.email);
                var jsonRequest = JsonConvert.SerializeObject(new { email = encryptedEmail });
                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                // Hacer la solicitud POST
                var response = await _httpClient.PostAsync("http://localhost:5000/usersbyemail", content);

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest("Error al realizar la solicitud al servicio externo.");
                }

                var responseData = await response.Content.ReadAsStringAsync();
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        // GET: api/Usuarios/info/5
        [HttpGet("Info/{id}")]
        public async Task<ActionResult<UsuarioInfoDTO>> GetUsuarioInfo(int id)
        {
            var usuario = await _context.Usuarios
                .Include(u => u.Emisor)
                .Include(u => u.Sucursal)
                .FirstOrDefaultAsync(u => u.UsuarioId == id);

            if (usuario == null)
            {
                return NotFound();
            }

            var usuarioInfo = new UsuarioInfoDTO
            {
                Nombre = usuario.Nombre,
                CorreoElectronico = usuario.CorreoElectronico,
                Emisor = new EmisorDTO
                {
                    EmisorId = usuario.Emisor.EmisorId,
                    Nombre = usuario.Emisor.Nombre
                },
                Sucursal = new SucursalDTO
                {
                    SucursalId = usuario.Sucursal.SucursalId,
                    Nombre = usuario.Sucursal.Nombre
                }
            };

            return usuarioInfo;
        }


        public class UsuarioCreacionDTO
        {
            public string? Nombre { get; set; }
            public string? CorreoElectronico { get; set; }
            public string? Contrasena { get; set; }
            public int? EmisorId { get; set; }
            public int? SucursalId { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult<Usuario>> PostUsuario(UsuarioCreacionDTO usuarioDto)
        {
            var usuario = new Usuario
            {
                Nombre = usuarioDto.Nombre,
                CorreoElectronico = usuarioDto.CorreoElectronico,
                Contrasena = usuarioDto.Contrasena,
                EmisorId = usuarioDto.EmisorId,
                SucursalId = usuarioDto.SucursalId
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUsuario", new { id = usuario.UsuarioId }, usuario);
        }

        public class UsuarioDTO
        {
            public int UsuarioId { get; set; }
            public string Nombre { get; set; }
            public string CorreoElectronico { get; set; }
        }

        // GET: api/Usuarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UsuarioDTO>>> GetUsuarios()
        {
            var usuarios = await _context.Usuarios
                .Select(u => new UsuarioDTO
                {
                    UsuarioId = u.UsuarioId,
                    Nombre = u.Nombre,
                    CorreoElectronico = u.CorreoElectronico
                }).ToListAsync();

            return usuarios;
        }




        // DELETE: api/Usuarios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            if (_context.Usuarios == null)
            {
                return NotFound();
            }
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
            {
                return NotFound();
            }

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UsuarioExists(int id)
        {
            return (_context.Usuarios?.Any(e => e.UsuarioId == id)).GetValueOrDefault();
        }
    }
}
