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
    [Route("Usuarios")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public UsuariosController(KattionDataBaseContext context)
        {
            _context = context;
        }

        public class UsuarioDTO
        {
            public int IdUsuario { get; set; }
            public string? Correo { get; set; }
            public string? Nombre { get; set; }
            public string? Apellido { get; set; }
        }

        // GET: api/Usuarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UsuarioDTO>>> GetUsuarios()
        {
          if (_context.Usuarios == null)
          {
              return NotFound();
          }
            return await _context.Usuarios
                .Select(u => new UsuarioDTO
                {
                    IdUsuario = u.IdUsuario,
                    Correo = u.Correo,
                    Nombre = u.Nombre,
                    Apellido = u.Apellido
                })
                .ToListAsync();
        }

        // GET: api/Usuarios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UsuarioDTO>> GetUsuario(int id)
        {
          if (_context.Usuarios == null)
          {
              return NotFound();
          }
            var usuario = await _context.Usuarios
                .Where(u => u.IdUsuario == id)
                .Select(u => new UsuarioDTO
                {
                    IdUsuario = u.IdUsuario,
                    Correo = u.Correo,
                    Nombre = u.Nombre,
                    Apellido = u.Apellido
                })
                .FirstOrDefaultAsync();

            if (usuario == null)
            {
                return NotFound();
            }

            return usuario;
        }

        // Nuevo DTO para POST y PUT
        public class UsuarioCreateUpdateDTO
        {
            public string? Correo { get; set; }
            public string? Nombre { get; set; }
            public string? Apellido { get; set; }
        }

        // Método para convertir de UsuarioCreateUpdateDTO a Usuario
        private Usuario FromCreateUpdateDTO(UsuarioCreateUpdateDTO dto)
        {
            return new Usuario
            {
                Correo = dto.Correo,
                Nombre = dto.Nombre,
                Apellido = dto.Apellido
            };
        }

        // POST: api/Usuarios
        [HttpPost]
        public async Task<ActionResult<UsuarioDTO>> PostUsuario(UsuarioCreateUpdateDTO usuarioDTO)
        {
            // Verificar si ya existe un usuario con el mismo correo electrónico
            var usuarioExistente = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Correo == usuarioDTO.Correo);

            if (usuarioExistente != null)
            {
                // Usuario ya existe, retornar código 200 con un mensaje
                return Ok(new
                {
                    IdUsuario = usuarioExistente.IdUsuario,
                    Correo = usuarioExistente.Correo,
                    Nombre = usuarioExistente.Nombre,
                    Apellido = usuarioExistente.Apellido,
                    Mensaje = "Usuario existente"
                });
            }

            // Crear un nuevo usuario
            var nuevoUsuario = FromCreateUpdateDTO(usuarioDTO);
            _context.Usuarios.Add(nuevoUsuario);
            await _context.SaveChangesAsync();

            // Retornar el nuevo usuario creado con un mensaje
            return CreatedAtAction(nameof(GetUsuario), new { id = nuevoUsuario.IdUsuario }, new
            {
                IdUsuario = nuevoUsuario.IdUsuario,
                Correo = nuevoUsuario.Correo,
                Nombre = nuevoUsuario.Nombre,
                Apellido = nuevoUsuario.Apellido,
                Mensaje = "Usuario nuevo"
            });
        }



        // PUT: api/Usuarios/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUsuario(int id, UsuarioCreateUpdateDTO usuarioDTO)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
            {
                return NotFound();
            }

            usuario.Correo = usuarioDTO.Correo;
            usuario.Nombre = usuarioDTO.Nombre;
            usuario.Apellido = usuarioDTO.Apellido;

            _context.Entry(usuario).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UsuarioExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }
        private bool UsuarioExists(int id)
        {
            return (_context.Usuarios?.Any(e => e.IdUsuario == id)).GetValueOrDefault();
        }
    }
}
