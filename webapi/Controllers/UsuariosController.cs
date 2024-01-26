using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;

namespace webapi.Controllers
{
    [Route("Usuario")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly SistemaNominaContext _context;

        public UsuariosController(SistemaNominaContext context)
        {
            _context = context;
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


        public class UsuarioInfoDTO
        {
            public string? Nombre { get; set; }
            public string? CorreoElectronico { get; set; }
            public EmisorDTO? Emisor { get; set; }
            public SucursalDTO? Sucursal { get; set; }
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
